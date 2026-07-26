"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, X, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import imageCompression from "browser-image-compression";

type State = "idle" | "processing" | "done" | "error";

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function CompressorPage() {
  const [state, setState] = useState<State>("idle");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [maxSizeMB, setMaxSizeMB] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const compress = useCallback(async (file: File, q: number, maxMB: number) => {
    setState("processing");
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: maxMB,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
        initialQuality: q / 100,
      });
      setCompressedBlob(compressed);
      setCompressedUrl(URL.createObjectURL(compressed));
      setState("done");
    } catch (e) {
      console.error(e);
      setError("Compression failed. Please try again.");
      setState("error");
    }
  }, []);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image."); return; }
    setError(null);
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    compress(file, quality, maxSizeMB);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const recompress = () => {
    if (originalFile) compress(originalFile, quality, maxSizeMB);
  };

  const download = () => {
    if (!compressedUrl || !originalFile) return;
    const a = document.createElement("a");
    a.href = compressedUrl;
    a.download = `compressed-${originalFile.name}`;
    a.click();
  };

  const reset = () => {
    setState("idle");
    setOriginalFile(null);
    setOriginalUrl(null);
    setCompressedBlob(null);
    setCompressedUrl(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const savings = originalFile && compressedBlob
    ? Math.round((1 - compressedBlob.size / originalFile.size) * 100)
    : 0;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-sm text-muted-foreground mb-8">
          <Link href="/tools" className="hover:text-primary">All Tools</Link>
          {" / "}
          <span className="text-foreground font-medium">Image Compressor</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Image Compressor</h1>
              <p className="text-muted-foreground">Reduce file size while maintaining visual quality. Faster loading, better conversions.</p>
            </div>

            <AnimatePresence mode="wait">
              {state === "idle" || state === "error" ? (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-3xl p-16 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200 group"
                  >
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
                    <div className="inline-flex p-5 rounded-2xl bg-emerald-100 mb-5 group-hover:bg-emerald-200 transition-colors">
                      <Upload className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Drop your image here</h3>
                    <p className="text-muted-foreground text-sm mb-4">PNG, JPG, WEBP up to 30MB</p>
                    <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 pointer-events-none">
                      Choose File
                    </Button>
                    <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
                      <p className="text-xs text-muted-foreground mb-3">— or try a sample —</p>
                      <div className="flex justify-center gap-3">
                        {[
                          { src: "https://images.unsplash.com/photo-1594035910387-fea4771d9f48?auto=format&fit=crop&q=80&w=800", label: "Perfume" },
                          { src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800", label: "Watch" },
                          { src: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=800", label: "Candle" },
                        ].map((sample) => (
                          <button
                            key={sample.label}
                            onClick={async (e) => {
                              e.stopPropagation();
                              const res = await fetch(sample.src);
                              const blob = await res.blob();
                              const file = new File([blob], `${sample.label.toLowerCase()}.jpg`, { type: "image/jpeg" });
                              handleFile(file);
                            }}
                            className="flex flex-col items-center gap-1 group/sample"
                          >
                            <div className="w-14 h-14 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group-hover/sample:border-emerald-400 transition-colors">
                              <img src={sample.src} alt={sample.label} className="w-full h-full object-contain p-1" />
                            </div>
                            <span className="text-xs text-muted-foreground group-hover/sample:text-emerald-600 transition-colors">{sample.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {state === "error" && <p className="mt-4 text-red-500 text-sm">{error}</p>}
                  </div>
                </motion.div>
              ) : state === "processing" ? (
                <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="glass-card p-12 text-center">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-100 border-t-emerald-500 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Compressing…</h3>
                  <p className="text-muted-foreground text-sm mt-2">Reducing file size while preserving quality.</p>
                </motion.div>
              ) : (
                <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Savings banner */}
                  {savings > 0 && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                      <div className="text-3xl font-bold text-emerald-600">{savings}%</div>
                      <div>
                        <p className="font-semibold text-emerald-700">Size reduced!</p>
                        <p className="text-xs text-emerald-600">
                          {formatBytes(originalFile!.size)} → {formatBytes(compressedBlob!.size)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Before / After */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Original</p>
                      {originalUrl && <img src={originalUrl} alt="Original" className="w-full rounded-xl object-contain max-h-48" />}
                      <p className="text-xs text-center mt-2 text-muted-foreground">{formatBytes(originalFile?.size || 0)}</p>
                    </div>
                    <div className="glass-card p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Compressed</p>
                      {compressedUrl && <img src={compressedUrl} alt="Compressed" className="w-full rounded-xl object-contain max-h-48" />}
                      <p className="text-xs text-center mt-2 text-emerald-600 font-medium">{formatBytes(compressedBlob?.size || 0)}</p>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="glass-card p-6 space-y-4">
                    <div>
                      <label className="flex justify-between text-sm font-medium mb-2">
                        <span>Quality</span>
                        <span className="text-emerald-600">{quality}%</span>
                      </label>
                      <input
                        type="range" min={10} max={100} value={quality}
                        onChange={(e) => setQuality(+e.target.value)}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="flex justify-between text-sm font-medium mb-2">
                        <span>Max size</span>
                        <span className="text-emerald-600">{maxSizeMB} MB</span>
                      </label>
                      <input
                        type="range" min={0.1} max={5} step={0.1} value={maxSizeMB}
                        onChange={(e) => setMaxSizeMB(+e.target.value)}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                    <Button onClick={recompress} variant="outline" className="w-full rounded-full">
                      Re-compress with new settings
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={download} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500">
                      <Download className="mr-2 w-4 h-4" />
                      Download Compressed Image
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
                {[{ name: "Background Remover", href: "/tools/remove-background" }, { name: "Image Resizer", href: "/tools/resize" }, { name: "Format Converter", href: "/tools/convert" }].map((t) => (
                  <Link key={t.name} href={t.href} className="px-3 py-1.5 rounded-full text-sm border border-border hover:border-emerald-300 hover:text-emerald-600 transition-colors">{t.name}</Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Why compress images?</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {["Faster page load times", "Better SEO rankings", "Lower storage costs", "Improved mobile experience", "Higher conversion rates"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white">
              <Sparkles className="w-6 h-6 mb-3 opacity-80" />
              <h3 className="font-bold text-lg mb-2">Want studio-quality product photos?</h3>
              <p className="text-white/80 text-sm mb-4">Create stunning AI-generated photos. Lifestyle shots, AI models, multiple backgrounds & more.</p>
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
