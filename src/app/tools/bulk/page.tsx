"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, X, Loader2, ArrowRight, Sparkles, CheckCircle2, AlertCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import imageCompression from "browser-image-compression";
import JSZip from "jszip";

type Operation = "compress" | "convert-webp" | "convert-jpg" | "convert-png";
type FileStatus = "queued" | "processing" | "done" | "error";

interface BatchFile {
  id: string;
  file: File;
  originalUrl: string;
  status: FileStatus;
  resultBlob?: Blob;
  resultUrl?: string;
  savings?: number;
  error?: string;
}

const OPERATIONS: { value: Operation; label: string; desc: string }[] = [
  { value: "compress", label: "Compress Images", desc: "Reduce file size, maintain quality" },
  { value: "convert-webp", label: "Convert to WEBP", desc: "Best for web performance" },
  { value: "convert-jpg", label: "Convert to JPG", desc: "Universal compatibility" },
  { value: "convert-png", label: "Convert to PNG", desc: "Lossless with transparency" },
];

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(2) + " MB";
}

async function processFile(file: File, op: Operation): Promise<Blob> {
  if (op === "compress") {
    return await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 4096, useWebWorker: true, initialQuality: 0.82 });
  }

  const mimeMap: Record<Operation, string> = {
    "compress": "image/jpeg",
    "convert-webp": "image/webp",
    "convert-jpg": "image/jpeg",
    "convert-png": "image/png",
  };
  const mime = mimeMap[op];

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      if (mime === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => { URL.revokeObjectURL(url); blob ? resolve(blob) : reject(new Error("Conversion failed")); }, mime, 0.92);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}

const extMap: Record<Operation, string> = {
  compress: "jpg",
  "convert-webp": "webp",
  "convert-jpg": "jpg",
  "convert-png": "png",
};

export default function BulkProcessorPage() {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [operation, setOperation] = useState<Operation>("compress");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(f => f.type.startsWith("image/"));
    const batch: BatchFile[] = validFiles.map(f => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      originalUrl: URL.createObjectURL(f),
      status: "queued",
    }));
    setFiles(prev => [...prev, ...batch]);
    setIsDone(false);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const processAll = async () => {
    if (files.length === 0 || isProcessing) return;
    setIsProcessing(true);
    setIsDone(false);

    for (const batchFile of files) {
      setFiles(prev => prev.map(f => f.id === batchFile.id ? { ...f, status: "processing" } : f));
      try {
        const resultBlob = await processFile(batchFile.file, operation);
        const savings = batchFile.file.size > 0 ? Math.max(0, Math.round((1 - resultBlob.size / batchFile.file.size) * 100)) : 0;
        setFiles(prev => prev.map(f => f.id === batchFile.id ? {
          ...f, status: "done", resultBlob, resultUrl: URL.createObjectURL(resultBlob), savings,
        } : f));
      } catch (err) {
        setFiles(prev => prev.map(f => f.id === batchFile.id ? { ...f, status: "error", error: "Processing failed" } : f));
      }
    }
    setIsProcessing(false);
    setIsDone(true);
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const ext = extMap[operation];
    files.forEach((f, i) => {
      if (f.resultBlob) {
        const name = f.file.name.replace(/\.[^.]+$/, "") + `-processed.${ext}`;
        zip.file(name, f.resultBlob);
      }
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ecom-toolkit-batch.zip";
    a.click();
  };

  const downloadSingle = (f: BatchFile) => {
    if (!f.resultUrl) return;
    const ext = extMap[operation];
    const a = document.createElement("a");
    a.href = f.resultUrl;
    a.download = f.file.name.replace(/\.[^.]+$/, "") + `-processed.${ext}`;
    a.click();
  };

  const doneCount = files.filter(f => f.status === "done").length;
  const totalSavings = files.reduce((acc, f) => acc + (f.savings || 0), 0);
  const avgSavings = doneCount > 0 ? Math.round(totalSavings / doneCount) : 0;

  const reset = () => { setFiles([]); setIsDone(false); if (inputRef.current) inputRef.current.value = ""; };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-sm text-muted-foreground mb-8">
          <Link href="/tools" className="hover:text-primary">All Tools</Link> {" / "}
          <span className="text-foreground font-medium">Bulk Image Processor</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">Bulk Image Processor</h1>
                <Badge variant="purple">New</Badge>
              </div>
              <p className="text-muted-foreground">Upload up to 50 images and process them all in one click. Download individually or as a ZIP.</p>
            </div>

            {/* Operation Selector */}
            <div className="glass-card p-5">
              <p className="text-sm font-semibold mb-3">Select Operation</p>
              <div className="grid grid-cols-2 gap-2">
                {OPERATIONS.map((op) => (
                  <button
                    key={op.value}
                    onClick={() => { setOperation(op.value); setIsDone(false); }}
                    className={`p-3 rounded-2xl border text-left transition-all ${operation === op.value ? "border-violet-500 bg-violet-50" : "border-border hover:border-violet-300"}`}
                  >
                    <p className={`text-sm font-semibold ${operation === op.value ? "text-violet-700" : ""}`}>{op.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{op.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-3xl p-10 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-all group"
            >
              <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleChange} />
              <div className="inline-flex p-4 rounded-2xl bg-violet-100 mb-4 group-hover:bg-violet-200 transition-colors">
                <Upload className="w-7 h-7 text-violet-600" />
              </div>
              <h3 className="font-semibold mb-1">Drop images here or click to browse</h3>
              <p className="text-sm text-muted-foreground">PNG, JPG, WEBP — up to 50 images at once</p>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-4">
                {/* Summary bar */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{files.length} image{files.length !== 1 ? "s" : ""} queued</p>
                  <button onClick={reset} className="text-xs text-muted-foreground hover:text-red-500 transition-colors">Clear all</button>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {files.map((f) => (
                    <div key={f.id} className="glass-card p-3 flex items-center gap-3">
                      <img src={f.originalUrl} alt={f.file.name} className="w-12 h-12 rounded-xl object-contain border border-gray-100 bg-gray-50 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{f.file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(f.file.size)}</p>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {f.status === "queued" && <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">Queued</span>}
                        {f.status === "processing" && <Loader2 className="w-4 h-4 text-violet-500 animate-spin" />}
                        {f.status === "done" && (
                          <div className="flex items-center gap-2">
                            {(f.savings || 0) > 0 && <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">-{f.savings}%</span>}
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <button onClick={() => downloadSingle(f)} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                              <Download className="w-3.5 h-3.5 text-violet-600" />
                            </button>
                          </div>
                        )}
                        {f.status === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
                        {!isProcessing && (
                          <button onClick={() => removeFile(f.id)} className="p-1 rounded-full hover:bg-gray-100 transition-colors ml-1">
                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  {!isDone ? (
                    <Button onClick={processAll} disabled={isProcessing || files.length === 0} className="flex-1">
                      {isProcessing ? (
                        <><Loader2 className="mr-2 w-4 h-4 animate-spin" />Processing {doneCount}/{files.length}…</>
                      ) : (
                        <><Package className="mr-2 w-4 h-4" />Process All {files.length} Images</>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={downloadAll} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500">
                      <Download className="mr-2 w-4 h-4" />
                      Download All as ZIP
                    </Button>
                  )}
                  <Button onClick={() => inputRef.current?.click()} variant="outline" className="rounded-full">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>

                {/* Stats */}
                {isDone && doneCount > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-emerald-700">{doneCount} images processed!</p>
                      {avgSavings > 0 && <p className="text-sm text-emerald-600">Average size reduction: {avgSavings}%</p>}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4">How it works</h3>
              <ol className="space-y-3">
                {[
                  { step: "1", title: "Upload images", desc: "Select multiple files at once or drag & drop" },
                  { step: "2", title: "Choose operation", desc: "Compress, convert or resize all images" },
                  { step: "3", title: "Download ZIP", desc: "Get all processed files in one ZIP archive" },
                ].map((item) => (
                  <li key={item.step} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{item.step}</div>
                    <div><p className="font-medium text-sm">{item.title}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-3">Pro tip</h3>
              <p className="text-sm text-muted-foreground">Compress all your product images before uploading to your store. Faster pages = more sales. A 1-second delay reduces conversions by 7%.</p>
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
