"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Download, X, ArrowRight, Sparkles, CheckCircle2,
  AlertTriangle, XCircle, Loader2, Copy, Package, Zap,
  Scissors, Archive, RefreshCw, Search
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import JSZip from "jszip";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MarketplaceSize {
  id: string;
  marketplace: string;
  name: string;
  w: number;
  h: number;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  note?: string;
}

interface GeneratedImage {
  size: MarketplaceSize;
  blob: Blob;
  url: string;
}

interface QualityCheck {
  label: string;
  status: "good" | "warning" | "error";
  message: string;
}

interface BatchFile {
  id: string;
  file: File;
  previewUrl: string;
  quality: QualityCheck[] | null;
  generated: GeneratedImage[];
  isGenerating: boolean;
  isDone: boolean;
}

// ─── Marketplace Presets ──────────────────────────────────────────────────────

const ALL_SIZES: MarketplaceSize[] = [
  { id: "shopify-product",    marketplace: "Shopify",    name: "Product Image",          w: 2048, h: 2048, emoji: "🛍️",  color: "text-[#96bf48]",  bgColor: "bg-green-50",    borderColor: "border-green-200",  note: "Recommended" },
  { id: "shopify-collection", marketplace: "Shopify",    name: "Collection Image",        w: 1024, h: 1024, emoji: "🛍️",  color: "text-[#96bf48]",  bgColor: "bg-green-50",    borderColor: "border-green-200" },
  { id: "amazon-main",        marketplace: "Amazon",     name: "Main Image",              w: 2000, h: 2000, emoji: "📦",  color: "text-[#ff9900]",  bgColor: "bg-orange-50",   borderColor: "border-orange-200", note: "White BG Required" },
  { id: "amazon-secondary",   marketplace: "Amazon",     name: "Secondary Image",         w: 1600, h: 1600, emoji: "📦",  color: "text-[#ff9900]",  bgColor: "bg-orange-50",   borderColor: "border-orange-200" },
  { id: "etsy-listing",       marketplace: "Etsy",       name: "Listing Image",           w: 2000, h: 2000, emoji: "🎨",  color: "text-[#f16521]",  bgColor: "bg-red-50",      borderColor: "border-red-200",    note: "Min 2000px" },
  { id: "ebay-listing",       marketplace: "eBay",       name: "Gallery Image",           w: 1600, h: 1600, emoji: "🔨",  color: "text-blue-600",   bgColor: "bg-blue-50",     borderColor: "border-blue-200",   note: "Recommended" },
  { id: "tiktok-product",     marketplace: "TikTok Shop",name: "Product Image",           w: 800,  h: 800,  emoji: "🎵",  color: "text-black",      bgColor: "bg-gray-100",    borderColor: "border-gray-300",   note: "Min 800px" },
  { id: "woo-product",        marketplace: "WooCommerce",name: "Product Image",           w: 800,  h: 800,  emoji: "🛒",  color: "text-[#7f54b3]",  bgColor: "bg-purple-50",   borderColor: "border-purple-200", note: "Default" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

async function resizeToBlob(file: File, w: number, h: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const srcUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(srcUrl);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      const scale = Math.min(w / img.naturalWidth, h / img.naturalHeight);
      const dx = (w - img.naturalWidth * scale) / 2;
      const dy = (h - img.naturalHeight * scale) / 2;
      ctx.drawImage(img, dx, dy, img.naturalWidth * scale, img.naturalHeight * scale);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Blob failed")),
        "image/jpeg", 0.92
      );
    };
    img.onerror = () => reject(new Error("Load failed"));
    img.src = srcUrl;
  });
}

async function runQualityCheck(file: File): Promise<QualityCheck[]> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const checks: QualityCheck[] = [];
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const mp = w * h;

      // Resolution
      if (mp >= 4_000_000) checks.push({ label: "Resolution", status: "good", message: `${w}×${h}px — Excellent resolution for all marketplaces` });
      else if (mp >= 1_000_000) checks.push({ label: "Resolution", status: "warning", message: `${w}×${h}px — Acceptable but may be too small for Amazon` });
      else checks.push({ label: "Resolution", status: "error", message: `${w}×${h}px — Too small. Most marketplaces require at least 1000px` });

      // Aspect ratio
      const ratio = w / h;
      if (Math.abs(ratio - 1) < 0.05) checks.push({ label: "Aspect Ratio", status: "good", message: "Square (1:1) — perfect for all marketplaces" });
      else if (Math.abs(ratio - 1) < 0.25) checks.push({ label: "Aspect Ratio", status: "warning", message: `${ratio.toFixed(2)}:1 — Slightly non-square. Will be padded to fit.` });
      else checks.push({ label: "Aspect Ratio", status: "error", message: `${ratio.toFixed(2)}:1 — Non-square. Products may appear with large white bars.` });

      // File size
      if (file.size > 25 * 1024 * 1024) checks.push({ label: "File Size", status: "error", message: `${formatBytes(file.size)} — Exceeds 25MB upload limit` });
      else if (file.size > 10 * 1024 * 1024) checks.push({ label: "File Size", status: "warning", message: `${formatBytes(file.size)} — Large file, consider compressing first` });
      else checks.push({ label: "File Size", status: "good", message: `${formatBytes(file.size)} — File size is fine` });

      // Canvas analysis for background
      const MAX = 300;
      const scale = Math.min(MAX / w, MAX / h, 1);
      const cw = Math.round(w * scale);
      const ch = Math.round(h * scale);
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, cw, ch);
      const data = ctx.getImageData(0, 0, cw, ch).data;

      // Transparency check
      let hasTransparency = false;
      if (file.type === "image/png") {
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 250) { hasTransparency = true; break; }
        }
      }
      if (hasTransparency) {
        checks.push({ label: "Transparency", status: "warning", message: "Image has transparent areas. Amazon requires a solid white background." });
      } else {
        checks.push({ label: "Transparency", status: "good", message: "No transparency detected" });
      }

      // White background check (sample corners)
      let cornerLumSum = 0;
      const d = 8;
      const samples = [
        [d, d], [cw - d, d], [d, ch - d], [cw - d, ch - d],
        [Math.floor(cw / 2), d], [Math.floor(cw / 2), ch - d],
      ];
      samples.forEach(([px, py]) => {
        const i = (Math.min(py, ch - 1) * cw + Math.min(px, cw - 1)) * 4;
        cornerLumSum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      });
      const avgCorner = cornerLumSum / samples.length;
      if (avgCorner > 230) checks.push({ label: "Background", status: "good", message: "White/light background detected — ready for Amazon & Shopify" });
      else if (avgCorner > 160) checks.push({ label: "Background", status: "warning", message: "Background may not be pure white. Amazon requires #FFFFFF background." });
      else checks.push({ label: "Background", status: "error", message: "Dark or coloured background detected. Amazon requires a pure white background." });

      resolve(checks);
    };
    img.onerror = () => resolve([]);
    img.src = url;
  });
}

// ─── Related Tools ────────────────────────────────────────────────────────────

const RELATED_TOOLS = [
  { name: "Background Remover", href: "/tools/remove-background", icon: Scissors, gradient: "from-violet-500 to-purple-600", desc: "Remove background for clean white images" },
  { name: "Image Compressor",   href: "/tools/compress",           icon: Archive,  gradient: "from-emerald-500 to-teal-500",  desc: "Reduce file size before uploading" },
  { name: "Image Upscaler",     href: "/tools/upscale",            icon: Zap,      gradient: "from-blue-500 to-indigo-500",   desc: "Boost resolution for small images" },
  { name: "Format Converter",   href: "/tools/convert",            icon: RefreshCw,gradient: "from-orange-500 to-amber-500",  desc: "Convert to WEBP, JPG or PNG" },
  { name: "Quality Checker",    href: "/tools/quality-check",      icon: Search,   gradient: "from-fuchsia-500 to-pink-600",  desc: "Score your image for marketplace readiness" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResizerPage() {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback(async (newFiles: File[]) => {
    const valid = newFiles.filter(f => f.type.startsWith("image/") && f.size <= 25 * 1024 * 1024);
    const batch: BatchFile[] = valid.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      previewUrl: URL.createObjectURL(f),
      quality: null,
      generated: [],
      isGenerating: false,
      isDone: false,
    }));
    setFiles(prev => [...prev, ...batch]);
    setShowResults(false);

    // Run quality checks in parallel
    for (const b of batch) {
      const q = await runQualityCheck(b.file);
      setFiles(prev => prev.map(f => f.id === b.id ? { ...f, quality: q } : f));
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const generateAll = async () => {
    if (isGeneratingAll) return;
    setIsGeneratingAll(true);
    setShowResults(false);

    for (const batchFile of files) {
      setFiles(prev => prev.map(f => f.id === batchFile.id ? { ...f, isGenerating: true, generated: [] } : f));
      const generated: GeneratedImage[] = [];
      for (const size of ALL_SIZES) {
        try {
          const blob = await resizeToBlob(batchFile.file, size.w, size.h);
          generated.push({ size, blob, url: URL.createObjectURL(blob) });
        } catch { /* skip failed sizes */ }
      }
      setFiles(prev => prev.map(f => f.id === batchFile.id ? { ...f, isGenerating: false, isDone: true, generated } : f));
    }

    setIsGeneratingAll(false);
    setShowResults(true);
  };

  const downloadSingle = (img: GeneratedImage, fileName: string) => {
    const a = document.createElement("a");
    a.href = img.url;
    a.download = `${fileName.replace(/\.[^.]+$/, "")}-${img.size.id}-${img.size.w}x${img.size.h}.jpg`;
    a.click();
  };

  const downloadAllZip = async () => {
    const zip = new JSZip();
    for (const batchFile of files) {
      if (!batchFile.isDone) continue;
      const folder = zip.folder(batchFile.file.name.replace(/\.[^.]+$/, ""))!;
      for (const gen of batchFile.generated) {
        folder.file(`${gen.size.marketplace}-${gen.size.name}-${gen.size.w}x${gen.size.h}.jpg`, gen.blob);
      }
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "marketplace-images.zip";
    a.click();
  };

  const copyDimensions = (size: MarketplaceSize) => {
    navigator.clipboard.writeText(`${size.w}x${size.h}`);
    setCopiedId(size.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const reset = () => {
    setFiles([]);
    setShowResults(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const totalDone = files.filter(f => f.isDone).length;
  const totalGenerated = files.reduce((acc, f) => acc + f.generated.length, 0);

  return (
    <div className="py-10">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-8">
          <Link href="/tools" className="hover:text-primary">All Tools</Link>
          {" / "}
          <span className="text-foreground font-medium">Multi-Marketplace Image Resizer</span>
        </div>

        {/* Header */}
        <div className="mb-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-4xl font-bold">Multi-Marketplace Image Resizer</h1>
            <Badge variant="purple">Premium</Badge>
          </div>
          <p className="text-lg text-muted-foreground">
            Upload once. Generate perfect product images for every marketplace automatically.
            Shopify, Amazon, Etsy, eBay, TikTok Shop, WooCommerce — all in one click.
          </p>
        </div>

        {/* ── Upload Zone ── */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-3xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 group mb-6"
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files) addFiles(Array.from(e.target.files)); }}
          />
          <div className="inline-flex p-5 rounded-2xl bg-blue-100 mb-5 group-hover:bg-blue-200 transition-colors">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Drop product images here</h3>
          <p className="text-muted-foreground text-sm mb-5">
            JPG, PNG, WEBP, AVIF — Up to 25MB each — Multiple files supported
          </p>
          <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 pointer-events-none">
            Choose Files
          </Button>
        </div>

        {/* ── Queued Files ── */}
        {files.length > 0 && (
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{files.length} image{files.length !== 1 ? "s" : ""} ready</h2>
              <button onClick={reset} className="text-sm text-muted-foreground hover:text-red-500 transition-colors">
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {files.map((bf) => (
                <motion.div key={bf.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
                  <div className="flex gap-4">
                    <img src={bf.previewUrl} alt={bf.file.name} className="w-20 h-20 object-contain rounded-2xl border border-gray-100 bg-gray-50 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="font-medium text-sm truncate">{bf.file.name}</p>
                        <button onClick={() => removeFile(bf.id)} className="p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
                          <X className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{formatBytes(bf.file.size)}</p>

                      {/* Quality checks */}
                      {bf.quality === null && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Analyzing image...
                        </div>
                      )}
                      {bf.quality && (
                        <div className="space-y-1">
                          {bf.quality.map((q) => (
                            <div key={q.label} className="flex items-start gap-1.5">
                              {q.status === "good"    && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />}
                              {q.status === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />}
                              {q.status === "error"   && <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />}
                              <p className="text-xs text-muted-foreground leading-tight">{q.message}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Progress */}
                      {bf.isGenerating && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse" style={{ width: "60%" }} />
                          </div>
                          <span className="text-xs text-blue-600 font-medium">Generating…</span>
                        </div>
                      )}
                      {bf.isDone && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {bf.generated.length} sizes generated
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── STICKY ACTION BAR ── */}
            <div className="sticky bottom-4 z-20">
              <div className="glass-card p-4 flex flex-col sm:flex-row items-center gap-3 shadow-2xl border-blue-100">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">
                    {isGeneratingAll
                      ? `Generating ${ALL_SIZES.length} sizes per image…`
                      : showResults
                      ? `✅ ${totalGenerated} images generated across ${totalDone} product${totalDone !== 1 ? "s" : ""}`
                      : `Ready to generate ${ALL_SIZES.length} marketplace sizes × ${files.length} product${files.length !== 1 ? "s" : ""}`
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Shopify · Amazon · Etsy · eBay · TikTok Shop · WooCommerce
                  </p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  {showResults && (
                    <Button
                      onClick={downloadAllZip}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-teal-500"
                    >
                      <Package className="mr-2 w-4 h-4" />
                      Download All ZIP
                    </Button>
                  )}
                  <Button
                    onClick={generateAll}
                    disabled={isGeneratingAll || files.length === 0}
                    className="flex-1 sm:flex-none bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    {isGeneratingAll
                      ? <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Generating…</>
                      : <><Zap className="mr-2 w-4 h-4" />Generate All Marketplace Sizes</>
                    }
                  </Button>
                </div>
              </div>
            </div>

            {/* ── RESULTS GRID ── */}
            <AnimatePresence>
              {showResults && files.some(f => f.isDone) && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-10"
                >
                  {files.filter(f => f.isDone).map((bf) => (
                    <div key={bf.id}>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-3">
                        <img src={bf.previewUrl} alt="" className="w-8 h-8 rounded-lg object-contain border border-gray-100 bg-gray-50" />
                        {bf.file.name}
                        <span className="text-sm font-normal text-muted-foreground">{bf.generated.length} sizes</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {bf.generated.map((gen) => (
                          <motion.div
                            key={gen.size.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`rounded-3xl border ${gen.size.borderColor} ${gen.size.bgColor} p-4 hover:shadow-md transition-all duration-200 group`}
                          >
                            {/* Marketplace badge */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{gen.size.emoji}</span>
                                <div>
                                  <p className={`text-xs font-bold ${gen.size.color}`}>{gen.size.marketplace}</p>
                                  <p className="text-xs text-muted-foreground">{gen.size.name}</p>
                                </div>
                              </div>
                              {gen.size.note && (
                                <span className="text-[10px] bg-white/70 border border-white px-1.5 py-0.5 rounded-full text-muted-foreground font-medium">
                                  {gen.size.note}
                                </span>
                              )}
                            </div>

                            {/* Preview */}
                            <div className="w-full aspect-square rounded-2xl bg-white border border-white/80 overflow-hidden mb-3 flex items-center justify-center">
                              <img
                                src={gen.url}
                                alt={gen.size.name}
                                loading="lazy"
                                className="w-full h-full object-contain"
                              />
                            </div>

                            {/* Dimensions */}
                            <p className="text-xs font-mono text-center text-muted-foreground mb-3 font-semibold">
                              {gen.size.w} × {gen.size.h} px
                            </p>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => downloadSingle(gen, bf.file.name)}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-white shadow-sm text-xs font-semibold py-2 rounded-xl hover:bg-gray-50 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download
                              </button>
                              <button
                                onClick={() => copyDimensions(gen.size)}
                                className="p-2 bg-white border border-white shadow-sm rounded-xl hover:bg-gray-50 transition-colors"
                                title="Copy dimensions"
                              >
                                {copiedId === gen.size.id
                                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  : <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                }
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* ── Premium Upgrade Banner ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 md:p-12 text-white"
                  >
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-5 h-5 text-yellow-300" />
                          <Badge variant="outline" className="border-white/30 text-white/90 text-xs">Coming Soon</Badge>
                        </div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-3">
                          Create Studio-Quality Product Photos
                        </h3>
                        <p className="text-white/80 text-base max-w-xl">
                          Turn your product into professional lifestyle images, luxury studio photos,
                          seasonal campaigns and social media creatives using AI.
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Link
                          href="/ai-photography"
                          className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-6 py-3 rounded-2xl hover:bg-white/90 transition-colors shadow-lg"
                        >
                          <Sparkles className="w-4 h-4" />
                          Explore AI Product Photography
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Marketplace Specs Reference ── */}
        {files.length === 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4">Supported Marketplaces</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ALL_SIZES.map((size) => (
                <div key={size.id} className={`rounded-2xl border ${size.borderColor} ${size.bgColor} p-4`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{size.emoji}</span>
                    <span className={`text-sm font-bold ${size.color}`}>{size.marketplace}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{size.name}</p>
                  <p className="text-xs font-mono font-semibold mt-1">{size.w}×{size.h}px</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Related Free Tools ── */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-2">Related Free Tools</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Get the most out of your product images with these complementary tools.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {RELATED_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className="glass-card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group block"
                >
                  <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${tool.gradient} mb-3`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-semibold text-sm mb-1 group-hover:text-violet-600 transition-colors">{tool.name}</p>
                  <p className="text-xs text-muted-foreground">{tool.desc}</p>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
