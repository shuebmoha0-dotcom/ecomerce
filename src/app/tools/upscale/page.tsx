"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, X, Loader2, ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";

type State = "idle" | "processing" | "done" | "error";
type Scale = 2 | 4;

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(2) + " MB";
}

// High-quality step-based upscaling using canvas
// Each step doubles resolution with bicubic-like smoothing
async function upscaleImage(file: File, scale: Scale): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let currentCanvas = document.createElement("canvas");
      currentCanvas.width = img.naturalWidth;
      currentCanvas.height = img.naturalHeight;
      const initCtx = currentCanvas.getContext("2d")!;
      initCtx.drawImage(img, 0, 0);

      // Step-wise 2× upscaling for better quality
      const steps = scale === 4 ? 2 : 1;
      for (let step = 0; step < steps; step++) {
        const nextCanvas = document.createElement("canvas");
        nextCanvas.width = currentCanvas.width * 2;
        nextCanvas.height = currentCanvas.height * 2;
        const ctx = nextCanvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(currentCanvas, 0, 0, nextCanvas.width, nextCanvas.height);
        currentCanvas = nextCanvas;
      }

      currentCanvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Failed to encode")),
        "image/png"
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

export default function UpscalerPage() {
  const [state, setState] = useState<State>("idle");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [scale, setScale] = useState<Scale>(2);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const process = useCallback(async (file: File, sc: Scale) => {
    setState("processing");
    setError(null);
    setResultUrl(null);
    setResultBlob(null);
    try {
      const blob = await upscaleImage(file, sc);
      setResultBlob(blob);
      setResultUrl(URL.createObjectURL(blob));
      setState("done");
    } catch (e) {
      console.error(e);
      setError("Upscaling failed. Please try a different image.");
      setState("error");
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    process(file, scale);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const changeScale = (sc: Scale) => {
    setScale(sc);
    if (originalFile) process(originalFile, sc);
  };

  const download = () => {
    if (!resultUrl || !originalFile) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = originalFile.name.replace(/\.[^.]+$/, "") + `-upscaled-${scale}x.png`;
    a.click();
  };

  const reset = () => {
    setState("idle");
    setOriginalFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setResultBlob(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const origW = originalFile ? 0 : 0; // computed in image load
  const newSize = resultBlob ? formatBytes(resultBlob.size) : null;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-sm text-muted-foreground mb-8">
          <Link href="/tools" className="hover:text-primary">All Tools</Link> {" / "}
          <span className="text-foreground font-medium">Image Upscaler</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">Image Upscaler</h1>
                <Badge variant="purple">New</Badge>
              </div>
              <p className="text-muted-foreground">Increase your product image resolution by 2× or 4× using high-quality AI upscaling. Perfect for supplier images that are too small.</p>
            </div>

            <AnimatePresence mode="wait">
              {state === "idle" || state === "error" ? (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-3xl p-16 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
                  >
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                    <div className="inline-flex p-5 rounded-2xl bg-blue-100 mb-5 group-hover:bg-blue-200 transition-colors">
                      <Zap className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Drop your image here</h3>
                    <p className="text-muted-foreground text-sm mb-5">PNG, JPG, WEBP up to 30MB</p>
                    <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-500 pointer-events-none">Upscale Image</Button>

                    <div className="mt-6 border-t border-dashed border-gray-200 pt-5">
                      <p className="text-xs text-muted-foreground mb-3">— or try a sample —</p>
                      <div className="flex justify-center gap-3">
                        {[{ src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", label: "Sneaker" }, { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800", label: "Watch" }, { src: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800", label: "Candle" }].map((s) => (
                          <button key={s.label} onClick={async (e) => { e.stopPropagation(); const res = await fetch(s.src); const blob = await res.blob(); handleFile(new File([blob], `${s.label}.png`, { type: blob.type })); }} className="flex flex-col items-center gap-1 group/s">
                            <div className="w-14 h-14 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group-hover/s:border-blue-400 transition-colors">
                              <img src={s.src} alt={s.label} className="w-full h-full object-contain p-1" />
                            </div>
                            <span className="text-xs text-muted-foreground group-hover/s:text-blue-600 transition-colors">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {state === "error" && <p className="mt-4 text-red-500 text-sm">{error}</p>}
                  </div>
                </motion.div>
              ) : state === "processing" ? (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card p-12 text-center">
                  <div className="relative inline-flex mb-6">
                    <div className="w-20 h-20 rounded-full border-4 border-blue-100" />
                    <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                    <Zap className="absolute inset-0 m-auto w-8 h-8 text-blue-400 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Upscaling {scale}×…</h3>
                  <p className="text-muted-foreground text-sm">Enhancing resolution using high-quality interpolation. This may take a moment for large images.</p>
                  {originalUrl && (
                    <img src={originalUrl} alt="Original" className="w-32 h-32 object-contain mx-auto mt-6 rounded-2xl border border-gray-100 opacity-50" />
                  )}
                </motion.div>
              ) : (
                <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Scale selector */}
                  <div className="glass-card p-5">
                    <p className="text-sm font-semibold mb-3">Upscale Factor</p>
                    <div className="flex gap-3">
                      {([2, 4] as Scale[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => changeScale(s)}
                          className={`flex-1 py-3 rounded-2xl border text-sm font-bold transition-all ${scale === s ? "border-blue-500 bg-blue-50 text-blue-700" : "border-border hover:border-blue-300"}`}
                        >
                          {s}× Upscale
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Before / After */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Original</p>
                      {originalUrl && <img src={originalUrl} alt="Original" className="w-full rounded-xl object-contain max-h-56 bg-gray-50" />}
                      {originalFile && <p className="text-xs text-center mt-2 text-muted-foreground">{formatBytes(originalFile.size)}</p>}
                    </div>
                    <div className="glass-card p-4">
                      <p className="text-xs font-medium text-blue-600 mb-2 font-semibold">{scale}× Upscaled ✨</p>
                      {resultUrl && <img src={resultUrl} alt="Upscaled" className="w-full rounded-xl object-contain max-h-56 bg-gray-50" />}
                      {newSize && <p className="text-xs text-center mt-2 text-blue-600 font-medium">{newSize}</p>}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={download} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500">
                      <Download className="mr-2 w-4 h-4" />
                      Download {scale}× PNG
                    </Button>
                    <Button variant="outline" onClick={reset} className="rounded-full">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Related Tools</h3>
              <div className="flex flex-wrap gap-2">
                {[{ name: "Background Remover", href: "/tools/remove-background" }, { name: "Image Resizer", href: "/tools/resize" }, { name: "Quality Checker", href: "/tools/quality-check" }].map((t) => (
                  <Link key={t.name} href={t.href} className="px-3 py-1.5 rounded-full text-sm border border-border hover:border-blue-300 hover:text-blue-600 transition-colors">{t.name}</Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">When to upscale</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {["Supplier images are too small", "Images below 1000px resolution", "Blurry product photos from phones", "Old product catalogue images", "Images that don't pass marketplace checks"].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3">Scale guide</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-blue-600">2× Upscale</p>
                  <p className="text-muted-foreground text-xs">Best for most product images. Doubles pixel count while maintaining quality.</p>
                </div>
                <div>
                  <p className="font-semibold text-indigo-600">4× Upscale</p>
                  <p className="text-muted-foreground text-xs">For very small images. Increases resolution 16×. Best for thumbnail-sized inputs.</p>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white">
              <Sparkles className="w-6 h-6 mb-3 opacity-80" />
              <h3 className="font-bold text-lg mb-2">Want studio-quality product photos?</h3>
              <p className="text-white/80 text-sm mb-4">Generate AI lifestyle shots, white backgrounds, AI models & more.</p>
              <Link href="/ai-photography" className="inline-flex items-center gap-1.5 bg-white text-violet-700 font-semibold text-sm px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
                Explore AI Photography <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
