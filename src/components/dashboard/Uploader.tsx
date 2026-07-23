"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function Uploader({ userId }: { userId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      // 1. Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('user-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('user-images')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      // 2. Save metadata to Supabase DB
      const { error: dbError } = await supabase
        .from('images')
        .insert({
          user_id: userId,
          original_url: imageUrl,
          processed_url: imageUrl, // Temporary until AI is wired
          marketplace: 'Original',
        });

      if (dbError) throw dbError;

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh the page data
      router.refresh();

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <UploadCloud className="w-5 h-5 text-violet-500" />
        Upload Image
      </h2>
      
      <div 
        className="flex-1 border-2 border-dashed border-violet-500/20 rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-violet-50/50 hover:bg-violet-50 transition-colors cursor-pointer relative min-h-[300px]"
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
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
            <p className="text-sm font-medium text-violet-600">Uploading securely...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <ImageIcon className="w-8 h-8 text-violet-500" />
            </div>
            <h3 className="font-semibold text-lg mb-1">Click to browse</h3>
            <p className="text-sm text-muted-foreground mb-4">PNG, JPG or WebP up to 10MB</p>
            <Button variant="default" size="sm" type="button">Select File</Button>
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
