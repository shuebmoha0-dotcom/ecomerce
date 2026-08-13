"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { removeBackground } from "@imgly/background-removal";
import imageCompression from "browser-image-compression";

type Marketplace = "Amazon" | "Shopify" | "Etsy";

const MARKETPLACES: Record<Marketplace, { width: number, height: number, bg: "white" | "transparent" }> = {
  "Amazon": { width: 1000, height: 1000, bg: "white" },
  "Shopify": { width: 2048, height: 2048, bg: "transparent" },
  "Etsy": { width: 2700, height: 2025, bg: "white" }
};

export function Uploader({ userId }: { userId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [marketplace, setMarketplace] = useState<Marketplace>("Amazon");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const processImage = async (file: File, config: { width: number, height: number, bg: string }) => {
    // 1. Remove Background
    setStatusText("Removing background with AI...");
    const transparentBlob = await removeBackground(file);

    // 2. Load into Image object to draw on Canvas
    setStatusText("Resizing & formatting for " + marketplace + "...");
    const imgUrl = URL.createObjectURL(transparentBlob);
    const img = new Image();
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imgUrl;
    });

    // 3. Canvas Resizing and Padding
    const canvas = document.createElement('canvas');
    canvas.width = config.width;
    canvas.height = config.height;
    const ctx = canvas.getContext('2d')!;

    if (config.bg === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Calculate scaling to fit within 85% of the canvas to leave nice padding
    const padding = 0.85;
    const scale = Math.min(
      (canvas.width * padding) / img.width,
      (canvas.height * padding) / img.height
    );

    const drawWidth = img.width * scale;
    const drawHeight = img.height * scale;
    
    // Center the image
    const x = (canvas.width - drawWidth) / 2;
    const y = (canvas.height - drawHeight) / 2;

    ctx.drawImage(img, x, y, drawWidth, drawHeight);

    // 4. Convert Canvas to Blob
    const finalBlob: Blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b!), config.bg === 'transparent' ? 'image/png' : 'image/jpeg', 1.0);
    });

    // 5. Compress
    setStatusText("Compressing & optimizing...");
    const compressedFile = await imageCompression(new File([finalBlob], "processed.jpg", { 
      type: config.bg === 'transparent' ? 'image/png' : 'image/jpeg' 
    }), {
      maxSizeMB: 1,
      maxWidthOrHeight: Math.max(config.width, config.height),
      useWebWorker: true
    });

    URL.revokeObjectURL(imgUrl);
    return compressedFile;
  };

  const uploadToSupabase = async (file: File, path: string) => {
    const { error: uploadError } = await supabase.storage.from('user-images').upload(path, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('user-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      // Upload original quickly in background
      const origExt = file.name.split('.').pop();
      const origPath = `uploads/${userId}-orig-${Date.now()}.${origExt}`;
      const uploadOrigPromise = uploadToSupabase(file, origPath);

      // Process the image
      const config = MARKETPLACES[marketplace];
      const processedFile = await processImage(file, config);

      setStatusText("Uploading final image...");
      const processedExt = config.bg === 'transparent' ? 'png' : 'jpg';
      const processedPath = `uploads/${userId}-processed-${Date.now()}.${processedExt}`;
      const processedUrl = await uploadToSupabase(processedFile, processedPath);
      
      const originalUrl = await uploadOrigPromise;

      // Save to database
      setStatusText("Saving to Gallery...");
      const { error: dbError } = await supabase.from('images').insert({
        user_id: userId,
        original_url: originalUrl,
        processed_url: processedUrl,
        marketplace: marketplace,
      });

      if (dbError) throw dbError;

      if (fileInputRef.current) fileInputRef.current.value = '';
      router.refresh();

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process image. Make sure it is a valid photo.');
    } finally {
      setIsUploading(false);
      setStatusText("");
    }
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-violet-500" />
          Upload Image
        </h2>
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-foreground block mb-2">Target Marketplace</label>
        <div className="flex gap-2">
          {(Object.keys(MARKETPLACES) as Marketplace[]).map((mp) => (
            <button
              key={mp}
              onClick={() => setMarketplace(mp)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                marketplace === mp 
                  ? "bg-violet-50 border-violet-500 text-violet-700 shadow-sm" 
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {marketplace === mp && <CheckCircle2 className="w-4 h-4 inline-block mr-1 -mt-0.5" />}
              {mp}
            </button>
          ))}
        </div>
      </div>
      
      <div 
        className={`flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center transition-colors min-h-[250px] relative
          ${isUploading ? 'bg-violet-50/50 border-violet-500/20' : 'bg-violet-50/30 border-violet-500/30 hover:bg-violet-50/80 cursor-pointer'}
        `}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          className="hidden" 
          accept="image/png, image/jpeg, image/webp" 
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
        {isUploading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
            <p className="text-sm font-semibold text-violet-700 bg-white px-4 py-2 rounded-full shadow-sm border border-violet-100 animate-pulse">
              {statusText}
            </p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-violet-100">
              <ImageIcon className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Click to upload</h3>
            <p className="text-sm text-muted-foreground mb-4">PNG, JPG up to 10MB</p>
            <Button variant="default" size="sm" type="button" className="pointer-events-none">Select File</Button>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
