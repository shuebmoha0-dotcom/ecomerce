"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, Loader2, X, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { removeBackground } from "@imgly/background-removal";

type State = "idle" | "uploading" | "processing" | "done" | "error";

export default function BackgroundRemoverPage() {
  const [state, setState] = useState<State>("idle");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    setError(null);
    setResultUrl(null);
    setProgress(0);
    setOriginalUrl(URL.createObjectURL(file));
    setState("processing");

    try {
      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          if (total > 0) setProgress(Math.round((current / total) * 100));
        },
      });
      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      setState("done");
    } catch (err) {
      console.error(err);
      setError("Processing failed. Please try again with a different image.");
      setState("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const reset = () => {
    setState("idle");
    setOriginalUrl(null);
    setResultUrl(null);
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = "background-removed.png";
    a.click();
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-8">
          <Link href="/tools" className="hover:text-primary">All Tools</Link>
          {" / "}
          <span className="text-foreground font-medium">Background Remover</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Tool Area */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Background Remover</h1>
              <p className="text-muted-foreground">
                Remove backgrounds from product images instantly using AI. Get transparent PNGs in seconds.
              </p>
            </div>

            {/* Upload Zone */}
            <AnimatePresence mode="wait">
              {state === "idle" || state === "error" ? (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-3xl p-16 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-all duration-200 group"
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleChange}
                    />
                    <div className="inline-flex p-5 rounded-2xl bg-violet-100 mb-5 group-hover:bg-violet-200 transition-colors">
                      <Upload className="w-8 h-8 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Drop your image here</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      PNG, JPG, WEBP up to 30MB
                    </p>
                    <Button variant="default" size="sm" className="pointer-events-none">
                      Choose File
                    </Button>
                    <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
                      <p className="text-xs text-muted-foreground mb-3">— or try a sample image —</p>
                      <div className="flex justify-center gap-3">
                        {[
                          { src: "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=800", label: "Handbag" },
                          { src: "https://images.unsplash.com/photo-1594035910387-fea4771d9f48?auto=format&fit=crop&q=80&w=800", label: "Perfume" },
                          { src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", label: "Sneaker" },
                        ].map((sample) => (
                          <button
                            key={sample.label}
                            onClick={async (e) => {
                              e.stopPropagation();
                              const res = await fetch(sample.src);
                              const blob = await res.blob();
                              const file = new File([blob], `${sample.label.toLowerCase()}.png`, { type: blob.type });
                              processFile(file);
                            }}
                            className="flex flex-col items-center gap-1 group/sample"
                          >
                            <div className="w-14 h-14 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group-hover/sample:border-violet-400 transition-colors">
                              <img src={sample.src} alt={sample.label} className="w-full h-full object-contain p-1" />
                            </div>
                            <span className="text-xs text-muted-foreground group-hover/sample:text-violet-600 transition-colors">{sample.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {state === "error" && (
                      <p className="mt-4 text-red-500 text-sm">{error}</p>
                    )}
                  </div>
                </motion.div>
              ) : state === "processing" ? (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-card p-12 text-center"
                >
                  <div className="relative inline-flex mb-6">
                    <div className="w-20 h-20 rounded-full border-4 border-violet-100" />
                    <div
                      className="absolute inset-0 w-20 h-20 rounded-full border-4 border-violet-600 border-t-transparent animate-spin"
                    />
                    <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-violet-400 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Removing background…</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    AI is processing your image. This may take a few seconds.
                  </p>
                  {progress > 0 && (
                    <div className="max-w-xs mx-auto">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 bg-violet-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-3">Before</p>
                      {originalUrl && (
                        <img src={originalUrl} alt="Original" className="w-full rounded-xl object-contain max-h-64" />
                      )}
                    </div>
                    <div className="glass-card p-4">
                      <p className="text-xs font-medium text-muted-foreground mb-3">After</p>
                      {resultUrl && (
                        <div className="relative rounded-xl overflow-hidden max-h-64 flex items-center justify-center"
                          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23e5e7eb'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23e5e7eb'/%3E%3C/svg%3E\")", backgroundSize: "16px 16px" }}>
                          <img src={resultUrl} alt="Result" className="w-full object-contain max-h-64" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={download} className="flex-1">
                      <Download className="mr-2 w-4 h-4" />
                      Download PNG
                    </Button>
                    <Button variant="outline" onClick={reset} className="rounded-full">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Related Tools */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Related Tools</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Image Resizer", href: "/tools/resize" },
                  { name: "Image Compressor", href: "/tools/compress" },
                  { name: "Format Converter", href: "/tools/convert" },
                ].map((t) => (
                  <Link
                    key={t.name}
                    href={t.href}
                    className="px-3 py-1.5 rounded-full text-sm border border-border hover:border-violet-300 hover:text-violet-600 transition-colors"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Steps */}
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">How it works</h3>
              <ol className="space-y-4">
                {[
                  { step: "1", title: "Upload", desc: "Add your product image (PNG, JPG, WEBP)" },
                  { step: "2", title: "AI Processing", desc: "Our AI model removes the background instantly" },
                  { step: "3", title: "Download", desc: "Get a transparent PNG ready for any marketplace" },
                ].map((item) => (
                  <li key={item.step} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.step}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* AI Upsell */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white">
              <Sparkles className="w-6 h-6 mb-3 opacity-80" />
              <h3 className="font-bold text-lg mb-2">
                Want studio-quality product photos?
              </h3>
              <p className="text-white/80 text-sm mb-4">
                Create stunning photos with AI. Lifestyle shots, AI models, multiple backgrounds & more.
              </p>
              <ul className="space-y-1.5 mb-5">
                {["Studio & lifestyle photos", "AI models & props", "Multiple angles", "Commercial license"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-white/90 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white/70 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/ai-photography"
                className="inline-flex items-center gap-1.5 bg-white text-violet-700 font-semibold text-sm px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
              >
                Explore AI Photography <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
