"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, X, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type State = "idle" | "done" | "error";
type Format = "image/png" | "image/jpeg" | "image/webp";

const FORMATS: { label: string; mime: Format; ext: string; desc: string }[] = [
  { label: "PNG", mime: "image/png", ext: "png", desc: "Lossless, transparency support. Best for logos & icons." },
  { label: "JPG", mime: "image/jpeg", ext: "jpg", desc: "Lossy, smaller files. Best for photos & marketplace listings." },
  { label: "WEBP", mime: "image/webp", ext: "webp", desc: "Modern format, excellent compression. Best for web." },
];

export default function ConverterPage() {
  const [state, setState] = useState<State>("idle");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<Format>("image/webp");
  const [quality, setQuality] = useState(92);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image."); setState("error"); return; }
    setError(null);
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setState("done");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const convert = useCallback(() => {
    if (!originalUrl || !originalFile) return;
    const ext = FORMATS.find((f) => f.mime === selectedFormat)?.ext || "png";
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      if (selectedFormat === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `converted.${ext}`;
          a.click();
        },
        selectedFormat,
        quality / 100
      );
    };
    img.src = originalUrl;
  }, [originalUrl, originalFile, selectedFormat, quality]);

  const reset = () => {
    setState("idle");
    setOriginalUrl(null);
    setOriginalFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const currentFmt = FORMATS.find((f) => f.mime === selectedFormat)!;

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-sm text-muted-foreground mb-8">
          <Link href="/tools" className="hover:text-primary">All Tools</Link>
          {" / "}
          <span className="text-foreground font-medium">Format Converter</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Format Converter</h1>
              <p className="text-muted-foreground">Convert your product images between PNG, JPG and WEBP instantly. No quality loss.</p>
            </div>

            <AnimatePresence mode="wait">
              {state === "idle" || state === "error" ? (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-3xl p-16 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/30 transition-all duration-200 group"
                  >
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                    <div className="inline-flex p-5 rounded-2xl bg-orange-100 mb-5 group-hover:bg-orange-200 transition-colors">
                      <Upload className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Drop your image here</h3>
                    <p className="text-muted-foreground text-sm mb-4">PNG, JPG, WEBP up to 30MB</p>
                    <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 pointer-events-none">Choose File</Button>
                    <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
                      <p className="text-xs text-muted-foreground mb-3">— or try a sample —</p>
                      <div className="flex justify-center gap-3">
                        {[
                          { src: "/sample-handbag.png", label: "Handbag" },
                          { src: "/sample-sneaker.png", label: "Sneaker" },
                          { src: "/sample-watch.png", label: "Watch" },
                        ].map((sample) => (
                          <button
                            key={sample.label}
                            onClick={async (e) => {
                              e.stopPropagation();
                              const res = await fetch(sample.src);
                              const blob = await res.blob();
                              const file = new File([blob], `${sample.label.toLowerCase()}.png`, { type: blob.type });
                              handleFile(file);
                            }}
                            className="flex flex-col items-center gap-1 group/sample"
                          >
                            <div className="w-14 h-14 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group-hover/sample:border-orange-400 transition-colors">
                              <img src={sample.src} alt={sample.label} className="w-full h-full object-contain p-1" />
                            </div>
                            <span className="text-xs text-muted-foreground group-hover/sample:text-orange-600 transition-colors">{sample.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {state === "error" && <p className="mt-4 text-red-500 text-sm">{error}</p>}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Preview */}
                  <div className="glass-card p-4 flex items-start gap-4">
                    {originalUrl && <img src={originalUrl} alt="Original" className="w-24 h-24 object-contain rounded-xl border border-border" />}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{originalFile?.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {originalFile?.type.split("/")[1].toUpperCase()} → converting to{" "}
                        <strong className="text-orange-600">{currentFmt.label}</strong>
                      </p>
                    </div>
                    <button onClick={reset} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Format selector */}
                  <div className="glass-card p-6 space-y-5">
                    <h3 className="font-semibold">Output Format</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {FORMATS.map((fmt) => (
                        <button
                          key={fmt.mime}
                          onClick={() => setSelectedFormat(fmt.mime)}
                          className={`p-4 rounded-2xl border text-center transition-all ${
                            selectedFormat === fmt.mime
                              ? "border-orange-500 bg-orange-50"
                              : "border-border hover:border-orange-300"
                          }`}
                        >
                          <div className={`text-2xl font-bold mb-1 ${selectedFormat === fmt.mime ? "text-orange-600" : "text-muted-foreground"}`}>
                            {fmt.label}
                          </div>
                          <div className="text-xs text-muted-foreground">{fmt.desc.split(".")[0]}</div>
                        </button>
                      ))}
                    </div>

                    <p className="text-sm text-muted-foreground bg-gray-50 rounded-2xl p-3">{currentFmt.desc}</p>

                    {selectedFormat !== "image/png" && (
                      <div>
                        <label className="flex justify-between text-sm font-medium mb-2">
                          <span>Quality</span>
                          <span className="text-orange-600">{quality}%</span>
                        </label>
                        <input
                          type="range" min={10} max={100} value={quality}
                          onChange={(e) => setQuality(+e.target.value)}
                          className="w-full accent-orange-500"
                        />
                      </div>
                    )}

                    <Button onClick={convert} className="w-full bg-gradient-to-r from-orange-500 to-amber-500">
                      <Download className="mr-2 w-4 h-4" />
                      Convert & Download {currentFmt.label}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Related Tools</h3>
              <div className="flex flex-wrap gap-2">
                {[{ name: "Background Remover", href: "/tools/remove-background" }, { name: "Image Resizer", href: "/tools/resize" }, { name: "Image Compressor", href: "/tools/compress" }].map((t) => (
                  <Link key={t.name} href={t.href} className="px-3 py-1.5 rounded-full text-sm border border-border hover:border-orange-300 hover:text-orange-600 transition-colors">{t.name}</Link>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Format Guide</h3>
              <div className="space-y-4">
                {FORMATS.map((fmt) => (
                  <div key={fmt.mime}>
                    <p className="font-semibold text-sm text-orange-600">{fmt.label}</p>
                    <p className="text-xs text-muted-foreground">{fmt.desc}</p>
                  </div>
                ))}
              </div>
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
