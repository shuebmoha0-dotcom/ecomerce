import { supabase } from "@/lib/supabase";
import { Image as ImageIcon, Download, ExternalLink } from "lucide-react";
import Image from "next/image";

export async function Gallery({ userId }: { userId: string }) {
  // Fetch images for this user
  const { data: images, error } = await supabase
    .from("images")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching images:", error);
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-lg">
        Failed to load images.
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-12">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
          <ImageIcon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No images yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Upload your first product image on the left to get started with formatting.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {images.map((img) => (
        <div key={img.id} className="group relative bg-white rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all">
          <div className="aspect-square relative bg-gray-50 flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={img.processed_url} 
              alt="Product Image" 
              className="max-w-full max-h-full object-contain"
            />
            
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <a 
                href={img.processed_url} 
                target="_blank" 
                rel="noreferrer"
                className="bg-white text-gray-900 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 hover:bg-gray-100"
              >
                <ExternalLink className="w-3 h-3" /> View
              </a>
            </div>
          </div>
          <div className="p-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium bg-violet-100 text-violet-700 px-2 py-0.5 rounded">
                {img.marketplace}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(img.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
