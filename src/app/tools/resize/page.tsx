"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, X, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type State = "idle" | "done" | "error";

const MARKETPLACE_PRESETS: Record<string, { label: string; sizes: { name: string; w: number; h: number }[] }> = {
  shopify: {
    label: "Shopify",
    sizes: [
      { name: "Product (2048×2048)", w: 2048, h: 2048 },
      { name: "Collection (1024×1024)", w: 1024, h: 1024 },
      { name: "Cart thumbnail (100×100)", w: 100, h: 100 },
    ],
  },
  amazon: {
    label: "Amazon",
    sizes: [
      { name: "Main image (2000×2000)", w: 2000, h: 2000 },
      { name: "Additional image (1600×1600)", w: 1600, h: 1600 },
      { name: "Thumbnail (500×500)", w: 500, h: 500 },
    ],
  },
  etsy: {
    label: "Etsy",
    sizes: [
      { name: "Listing (2000×2000)", w: 2000, h: 2000 },
      { name: "Shop icon (500×500)", w: 500, h: 500 },
      { name: "Banner (3360×840)", w: 3360, h: 840 },
    ],
  },
  ebay: {
    label: "eBay",
    sizes: [
      { name: "Gallery (1600×1600)", w: 1600, h: 1600 },
      { name: "Full size (800×800)", w: 800, h: 800 },
    ],
  },
  tiktok: {
    label: "TikTok Shop",
    sizes: [
      { name: "Product (800×800)", w: 800, h: 800 },
      { name: "Cover (1080×1080)", w: 1080, h: 1080 },
    ],
  },
};

export default function ResizerPage() {
  const [state, setState] = useState<State>("idle");
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [selectedMarketplace, setSelectedMarketplace] = useState("shopify");
  const [selectedSize, setSelectedSize] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image."); return; }
    setError(null);
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setState("done");
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const downloadResized = useCallback(() => {
    if (!originalFile) return;
    const preset = MARKETPLACE_PRESETS[selectedMarketplace];
    const size = preset.sizes[selectedSize];

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size.w;
      canvas.height = size.h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // Fill white background and contain image
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size.w, size.h);
      const scale = Math.min(size.w / img.width, size.h / img.height);
      const dx = (size.w - img.width * scale) / 2;
      const dy = (size.h - img.height * scale) / 2;
      ctx.drawImage(img, dx, dy, img.width * scale, img.height * scale);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `resized-${size.w}x${size.h}.jpg`;
        a.click();
      }, "image/jpeg", 0.92);
    };
    img.src = originalUrl!;
  }, [originalFile, originalUrl, selectedMarketplace, selectedSize]);

  const reset = () => {
    setState("idle");
    setOriginalUrl(null);
    setOriginalFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const preset = MARKETPLACE_PRESETS[selectedMarketplace];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-sm text-muted-foreground mb-8">
          <Link href="/tools" className="hover:text-primary">All Tools</Link>
          {" / "}
          <span className="text-foreground font-medium">Marketplace Image Resizer</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Marketplace Image Resizer</h1>
              <p className="text-muted-foreground">
                Resize your product images to exact specifications for Shopify, Amazon, Etsy, eBay and TikTok Shop.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {state === "idle" ? (
                <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => inputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-3xl p-16 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 group"
                  >
                    <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
                    <div className="inline-flex p-5 rounded-2xl bg-blue-100 mb-5 group-hover:bg-blue-200 transition-colors">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Drop your image here</h3>
                    <p className="text-muted-foreground text-sm mb-4">PNG, JPG, WEBP up to 30MB</p>
                    <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 pointer-events-none">
                      Choose File
                    </Button>
                    {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="config" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {/* Preview */}
                  <div className="glass-card p-4">
                    <div className="flex items-start gap-4">
                      {originalUrl && (
                        <img src={originalUrl} alt="Original" className="w-28 h-28 object-contain rounded-xl border border-border" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-1">Original image loaded</p>
                        <p className="text-xs text-muted-foreground">{originalFile?.name}</p>
                      </div>
                      <button onClick={reset} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Marketplace Selector */}
                  <div className="glass-card p-6 space-y-4">
                    <h3 className="font-semibold">Select Marketplace</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(MARKETPLACE_PRESETS).map(([key, val]) => (
                        <button
                          key={key}
                          onClick={() => { setSelectedMarketplace(key); setSelectedSize(0); }}
                          className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                            selectedMarketplace === key
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-border hover:border-blue-300 text-muted-foreground"
                          }`}
                        >
                          {val.label}
                        </button>
                      ))}
                    </div>

                    <h3 className="font-semibold">Select Size</h3>
                    <div className="space-y-2">
                      {preset.sizes.map((size, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedSize(i)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm transition-all ${
                            selectedSize === i
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-border hover:border-blue-200"
                          }`}
                        >
                          <span className="font-medium">{size.name}</span>
                          <span className={`font-mono text-xs ${selectedSize === i ? "text-blue-500" : "text-muted-foreground"}`}>
                            {size.w}×{size.h}px
                          </span>
                        </button>
                      ))}
                    </div>

                    <Button onClick={downloadResized} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500">
                      <Download className="mr-2 w-4 h-4" />
                      Download Resized Image
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Related tools */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Related Tools</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Background Remover", href: "/tools/remove-background" },
                  { name: "Image Compressor", href: "/tools/compress" },
                  { name: "Format Converter", href: "/tools/convert" },
                ].map((t) => (
                  <Link key={t.name} href={t.href}
                    className="px-3 py-1.5 rounded-full text-sm border border-border hover:border-blue-300 hover:text-blue-600 transition-colors">
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">Marketplace Requirements</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /><span><strong className="text-foreground">Shopify:</strong> 2048×2048px recommended</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /><span><strong className="text-foreground">Amazon:</strong> Min 1000px on longest side</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /><span><strong className="text-foreground">Etsy:</strong> 2000px minimum</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /><span><strong className="text-foreground">eBay:</strong> 1600px minimum recommended</span></li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /><span><strong className="text-foreground">TikTok Shop:</strong> 800×800px minimum</span></li>
              </ul>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white">
              <Sparkles className="w-6 h-6 mb-3 opacity-80" />
              <h3 className="font-bold text-lg mb-2">Want studio-quality product photos?</h3>
              <p className="text-white/80 text-sm mb-4">Create stunning photos with AI. Lifestyle shots, AI models, multiple backgrounds & more.</p>
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
