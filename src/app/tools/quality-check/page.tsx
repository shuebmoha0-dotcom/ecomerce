"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ArrowRight, Sparkles, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

type AnalysisState = "idle" | "analyzing" | "done" | "error";

interface Score {
  label: string;
  score: number; // 0–100
  status: "good" | "warning" | "bad";
  tip: string;
}

interface AnalysisResult {
  overall: number;
  width: number;
  height: number;
  scores: Score[];
}

function gradeColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-500";
  return "text-red-500";
}

function gradeBg(score: number) {
  if (score >= 80) return "bg-emerald-50 border-emerald-200";
  if (score >= 60) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function gradeLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";
  return "Needs Work";
}

function analyzeImage(img: HTMLImageElement, file: File): AnalysisResult {
  const canvas = document.createElement("canvas");
  const MAX = 400;
  const scale = Math.min(MAX / img.naturalWidth, MAX / img.naturalHeight, 1);
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  // ─── Brightness ───
  let totalLum = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    totalLum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const avgLum = totalLum / n;
  let brightnessScore: number;
  if (avgLum < 60) brightnessScore = Math.round((avgLum / 60) * 50);
  else if (avgLum > 235) brightnessScore = Math.round(50 + ((255 - avgLum) / 20) * 30);
  else brightnessScore = Math.round(75 + Math.min(25, (1 - Math.abs(avgLum - 140) / 100) * 25));

  const brightnessTip =
    avgLum < 60 ? "Image is too dark. Add more lighting when shooting." :
    avgLum > 235 ? "Image is overexposed. Reduce light intensity or add a reflector." :
    "Lighting looks good! Consistent and well-balanced.";

  // ─── Sharpness (Laplacian variance) ───
  let sharpSum = 0;
  const w = canvas.width;
  for (let y = 1; y < canvas.height - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      const l = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const lUp = 0.299 * data[idx - w * 4] + 0.587 * data[idx - w * 4 + 1] + 0.114 * data[idx - w * 4 + 2];
      const lDn = 0.299 * data[idx + w * 4] + 0.587 * data[idx + w * 4 + 1] + 0.114 * data[idx + w * 4 + 2];
      const lLf = 0.299 * data[idx - 4] + 0.587 * data[idx - 3] + 0.114 * data[idx - 2];
      const lRt = 0.299 * data[idx + 4] + 0.587 * data[idx + 5] + 0.114 * data[idx + 6];
      const lap = Math.abs(4 * l - lUp - lDn - lLf - lRt);
      sharpSum += lap;
    }
  }
  const sharpness = sharpSum / ((canvas.width - 2) * (canvas.height - 2));
  const sharpScore = Math.min(100, Math.round((sharpness / 12) * 100));
  const sharpTip =
    sharpScore < 40 ? "Image appears blurry. Use a tripod and ensure your subject is in focus." :
    sharpScore < 70 ? "Moderate sharpness. Try a faster shutter speed to avoid motion blur." :
    "Sharp and crisp! Great focus on your product.";

  // ─── Background Cleanliness (check corners for near-white) ───
  const cornerSamples: number[] = [];
  const cw = canvas.width, ch = canvas.height;
  const checkCorner = (px: number, py: number) => {
    const i = (py * cw + px) * 4;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };
  for (let d = 0; d < 10; d++) {
    cornerSamples.push(checkCorner(d, d), checkCorner(cw - 1 - d, d), checkCorner(d, ch - 1 - d), checkCorner(cw - 1 - d, ch - 1 - d));
  }
  const avgCorner = cornerSamples.reduce((a, b) => a + b, 0) / cornerSamples.length;
  const bgScore = Math.min(100, Math.round((avgCorner / 255) * 100));
  const bgTip =
    bgScore < 50 ? "Dark or cluttered background detected. Use a white or plain background for marketplace listings." :
    bgScore < 75 ? "Background may not be pure white. Marketplaces like Amazon require a pure white (#fff) background." :
    "Clean, light background detected. Great for marketplace listings!";

  // ─── Resolution ───
  const mp = img.naturalWidth * img.naturalHeight;
  const resScore =
    mp >= 4000000 ? 100 :
    mp >= 2000000 ? 90 :
    mp >= 1000000 ? 75 :
    mp >= 500000  ? 55 :
    Math.round((mp / 500000) * 55);
  const resTip =
    resScore < 55 ? `Resolution (${img.naturalWidth}×${img.naturalHeight}) is too low. Most marketplaces require at least 1000px on the long side.` :
    resScore < 80 ? `Resolution is acceptable but higher is better. Aim for 2000×2000px for Shopify/Amazon zoom features.` :
    `Excellent resolution (${img.naturalWidth}×${img.naturalHeight}). Supports zoom features on all platforms.`;

  // ─── Aspect Ratio ───
  const ratio = img.naturalWidth / img.naturalHeight;
  const ratioOff = Math.abs(ratio - 1);
  const ratioScore = Math.round(Math.max(0, 100 - ratioOff * 150));
  const ratioTip =
    ratioScore < 60 ? `Image is ${ratio > 1 ? "wider" : "taller"} than it is square (${img.naturalWidth}×${img.naturalHeight}). Most marketplaces prefer 1:1 square images.` :
    ratioScore < 85 ? "Nearly square. Cropping to 1:1 will improve performance on most marketplaces." :
    "Square or near-square aspect ratio. Perfect for product listings!";

  const scores: Score[] = [
    { label: "Lighting", score: brightnessScore, status: brightnessScore >= 75 ? "good" : brightnessScore >= 50 ? "warning" : "bad", tip: brightnessTip },
    { label: "Sharpness", score: sharpScore, status: sharpScore >= 60 ? "good" : sharpScore >= 40 ? "warning" : "bad", tip: sharpTip },
    { label: "Background", score: bgScore, status: bgScore >= 75 ? "good" : bgScore >= 50 ? "warning" : "bad", tip: bgTip },
    { label: "Resolution", score: resScore, status: resScore >= 75 ? "good" : resScore >= 55 ? "warning" : "bad", tip: resTip },
    { label: "Aspect Ratio", score: ratioScore, status: ratioScore >= 80 ? "good" : ratioScore >= 60 ? "warning" : "bad", tip: ratioTip },
  ];

  const overall = Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length);
  return { overall, width: img.naturalWidth, height: img.naturalHeight, scores };
}

export default function QualityCheckerPage() {
  const [state, setState] = useState<AnalysisState>("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setState("analyzing");
    setResult(null);
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setFileName(file.name);

    const img = new Image();
    img.onload = () => {
      setTimeout(() => {
        try {
          const r = analyzeImage(img, file);
          setResult(r);
          setState("done");
        } catch {
          setState("error");
        }
      }, 600); // small delay for UX
    };
    img.onerror = () => setState("error");
    img.src = url;
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setState("idle");
    setImageUrl(null);
    setFileName(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-sm text-muted-foreground mb-8">
          <Link href="/tools" className="hover:text-primary">All Tools</Link> {" / "}
          <span className="text-foreground font-medium">Photo Quality Checker</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">Photo Quality Checker</h1>
                <Badge variant="purple">New</Badge>
              </div>
              <p className="text-muted-foreground">Instantly analyze your product image and get a marketplace-readiness score with actionable tips.</p>
            </div>

            <AnimatePresence mode="wait">
              {state === "idle" && (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-3xl p-16 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-all group"
                  >
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                    <div className="inline-flex p-5 rounded-2xl bg-violet-100 mb-5 group-hover:bg-violet-200 transition-colors">
                      <Upload className="w-8 h-8 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Drop your product image here</h3>
                    <p className="text-muted-foreground text-sm mb-5">PNG, JPG, WEBP up to 30MB</p>
                    <Button size="sm" className="pointer-events-none">Analyze Image</Button>

                    {/* Sample images */}
                    <div className="mt-6 border-t border-dashed border-gray-200 pt-5">
                      <p className="text-xs text-muted-foreground mb-3">— or try a sample —</p>
                      <div className="flex justify-center gap-3">
                        {[{ src: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=800", label: "Handbag" }, { src: "https://images.unsplash.com/photo-1594035910387-fea4771d9f48?auto=format&fit=crop&q=80&w=800", label: "Perfume" }, { src: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800", label: "Lifestyle" }].map((s) => (
                          <button key={s.label} onClick={async (e) => { e.stopPropagation(); const res = await fetch(s.src); const blob = await res.blob(); handleFile(new File([blob], `${s.label}.jpg`, { type: blob.type })); }} className="flex flex-col items-center gap-1 group/s">
                            <div className="w-14 h-14 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group-hover/s:border-violet-400 transition-colors">
                              <img src={s.src} alt={s.label} className="w-full h-full object-contain p-1" />
                            </div>
                            <span className="text-xs text-muted-foreground group-hover/s:text-violet-600 transition-colors">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {state === "analyzing" && (
                <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    <div className="absolute inset-0 rounded-full border-4 border-violet-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-violet-600 border-t-transparent animate-spin" />
                    <span className="absolute inset-0 flex items-center justify-center text-2xl">🔍</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Analyzing your image…</h3>
                  <p className="text-sm text-muted-foreground">Checking lighting, sharpness, background, resolution & composition.</p>
                </motion.div>
              )}

              {state === "done" && result && (
                <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
                  {/* Overall Score */}
                  <div className={`glass-card p-6 flex items-center gap-6 border ${gradeBg(result.overall)}`}>
                    {imageUrl && <img src={imageUrl} alt="Analyzed" className="w-20 h-20 object-contain rounded-2xl border border-gray-100 bg-white flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">{fileName}</p>
                      <p className="text-sm text-muted-foreground">{result.width}×{result.height}px</p>
                    </div>
                    <div className="text-center flex-shrink-0">
                      <div className={`text-6xl font-bold ${gradeColor(result.overall)}`}>{result.overall}</div>
                      <div className={`text-sm font-semibold ${gradeColor(result.overall)}`}>{gradeLabel(result.overall)}</div>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="glass-card p-6 space-y-5">
                    <h3 className="font-semibold">Score Breakdown</h3>
                    {result.scores.map((s) => (
                      <div key={s.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {s.status === "good" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            {s.status === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                            {s.status === "bad" && <XCircle className="w-4 h-4 text-red-400" />}
                            <span className="text-sm font-medium">{s.label}</span>
                          </div>
                          <span className={`text-sm font-bold ${gradeColor(s.score)}`}>{s.score}/100</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${s.score}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`h-full rounded-full ${s.score >= 75 ? "bg-emerald-400" : s.score >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{s.tip}</p>
                      </div>
                    ))}
                  </div>

                  {/* Suggested tools */}
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-4 h-4 text-violet-500" />
                      <h3 className="font-semibold text-sm">Suggested fixes</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.scores.find(s => s.label === "Background" && s.score < 75) && (
                        <Link href="/tools/remove-background" className="px-3 py-1.5 rounded-full text-xs border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors">Remove Background →</Link>
                      )}
                      {result.scores.find(s => s.label === "Resolution" && s.score < 75) && (
                        <Link href="/tools/upscale" className="px-3 py-1.5 rounded-full text-xs border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">Upscale Image →</Link>
                      )}
                      {result.scores.find(s => s.label === "Aspect Ratio" && s.score < 80) && (
                        <Link href="/tools/resize" className="px-3 py-1.5 rounded-full text-xs border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">Resize for Marketplace →</Link>
                      )}
                      <Link href="/tools/compress" className="px-3 py-1.5 rounded-full text-xs border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">Compress for Web →</Link>
                    </div>
                  </div>

                  <Button onClick={reset} variant="outline" className="w-full rounded-full">Analyze Another Image</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">What we check</h3>
              <ul className="space-y-3">
                {[
                  { icon: "💡", label: "Lighting", desc: "Average luminance & brightness balance" },
                  { icon: "🔍", label: "Sharpness", desc: "Edge detection & blur analysis" },
                  { icon: "⬜", label: "Background", desc: "White/clean background detection" },
                  { icon: "📐", label: "Resolution", desc: "Pixel dimensions vs marketplace minimums" },
                  { icon: "⬛", label: "Aspect Ratio", desc: "Square vs non-square ratio check" },
                ].map((item) => (
                  <li key={item.label} className="flex gap-3">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-2">Score guide</h3>
              <div className="space-y-2 text-sm">
                {[{ range: "90–100", label: "Excellent", color: "text-emerald-600" }, { range: "80–89", label: "Good", color: "text-emerald-500" }, { range: "60–79", label: "Fair", color: "text-amber-500" }, { range: "Below 60", label: "Needs Work", color: "text-red-500" }].map((g) => (
                  <div key={g.range} className="flex justify-between">
                    <span className="text-muted-foreground">{g.range}</span>
                    <span className={`font-semibold ${g.color}`}>{g.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white">
              <Sparkles className="w-6 h-6 mb-3 opacity-80" />
              <h3 className="font-bold text-lg mb-2">Score too low?</h3>
              <p className="text-white/80 text-sm mb-4">Let AI generate perfect studio-quality product photos from scratch.</p>
              <Link href="/ai-photography" className="inline-flex items-center gap-1.5 bg-white text-violet-700 font-semibold text-sm px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
                Try AI Photography <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
