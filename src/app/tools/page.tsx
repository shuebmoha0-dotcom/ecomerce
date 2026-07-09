"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Scissors, Move, Archive, RefreshCw, ArrowRight, Sparkles, Package, Search, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const tools = [
  {
    icon: Scissors,
    name: "Background Remover",
    description: "Remove backgrounds instantly with AI. Get clean, transparent PNGs ready for any marketplace.",
    href: "/tools/remove-background",
    gradient: "from-violet-500 to-purple-600",
    tag: "Most Popular",
    previewBefore: "/sample-lifestyle.png",
    previewAfter: "/sample-handbag.png",
    previewType: "before-after",
  },
  {
    icon: Move,
    name: "Marketplace Image Resizer",
    description: "One click. Perfect sizes for Shopify, Amazon, Etsy, eBay & TikTok Shop.",
    href: "/tools/resize",
    gradient: "from-blue-500 to-cyan-500",
    tag: null,
    preview: "/sample-sneaker.png",
    previewType: "single",
  },
  {
    icon: Archive,
    name: "Image Compressor",
    description: "Reduce file size while maintaining quality. Faster load times, better conversions.",
    href: "/tools/compress",
    gradient: "from-emerald-500 to-teal-500",
    tag: null,
    preview: "/sample-perfume.png",
    previewType: "compress",
  },
  {
    icon: RefreshCw,
    name: "Format Converter",
    description: "Convert between PNG, JPG, WEBP and AVIF. Pick the best format for every platform.",
    href: "/tools/convert",
    gradient: "from-orange-500 to-amber-500",
    tag: null,
    preview: "/sample-watch.png",
    previewType: "format",
  },
  {
    icon: Package,
    name: "Bulk Image Processor",
    description: "Upload up to 50 images and process them all in one click. Download individually or as a ZIP.",
    href: "/tools/bulk",
    gradient: "from-indigo-500 to-blue-600",
    tag: "New",
    preview: "/sample-sneaker.png",
    previewType: "single",
  },
  {
    icon: Search,
    name: "Photo Quality Checker",
    description: "Analyze your product image and get a marketplace-readiness score with actionable tips.",
    href: "/tools/quality-check",
    gradient: "from-fuchsia-500 to-pink-600",
    tag: "New",
    previewBefore: "/sample-handbag.png",
    previewAfter: "/sample-handbag.png", // We can just use the same image, or handle it differently if needed, but 'single' type is better for this one. Let's make it single.
    preview: "/sample-watch.png",
    previewType: "single",
  },
  {
    icon: Zap,
    name: "Image Upscaler",
    description: "Increase resolution by 2× or 4× using high-quality AI upscaling.",
    href: "/tools/upscale",
    gradient: "from-blue-500 to-indigo-500",
    tag: "New",
    previewBefore: "/sample-lifestyle.png",
    previewAfter: "/sample-handbag.png",
    preview: "/sample-perfume.png",
    previewType: "single", // Upscaler preview can just be single for now since we don't have a specific before/after type built for it in this loop, or we could use before-after. Let's use before-after.
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: "easeOut" },
  }),
};

export default function ToolsPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Badge variant="purple" className="mb-4">Free Tools</Badge>
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
          >
            All Free Image Tools
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-lg text-muted-foreground max-w-xl mx-auto"
          >
            Everything you need to prepare product images for every marketplace. No signup required.
          </motion.p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {tools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.name}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i * 0.1 + 0.3}
              >
                <Link href={tool.href} className="block group h-full">
                  <div className="glass-card p-8 h-full hover:shadow-[0_20px_60px_rgb(124,58,237,0.12)] transition-all duration-300 hover:-translate-y-1.5 cursor-pointer">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${tool.gradient}`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      {tool.tag && (
                        <Badge variant="purple" className="text-xs">{tool.tag}</Badge>
                      )}
                    </div>

                    {/* Preview area with real images */}
                    <div className="rounded-2xl bg-gray-50 h-36 mb-6 overflow-hidden border border-gray-100 relative">
                      {tool.previewType === "before-after" ? (
                        <div className="grid grid-cols-2 h-full">
                          <div className="overflow-hidden">
                            <img src={(tool as {previewBefore?: string}).previewBefore} alt="Before" className="w-full h-full object-cover" />
                          </div>
                          <div className="overflow-hidden" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Crect width='6' height='6' fill='%23e5e7eb'/%3E%3Crect x='6' y='6' width='6' height='6' fill='%23e5e7eb'/%3E%3C/svg%3E\")", backgroundSize: "12px 12px" }}>
                            <img src={(tool as {previewAfter?: string}).previewAfter} alt="After" className="w-full h-full object-contain p-2" />
                          </div>
                        </div>
                      ) : tool.previewType === "compress" ? (
                        <div className="relative h-full flex items-center justify-center">
                          <img src={(tool as {preview?: string}).preview} alt="Preview" className="h-full w-full object-contain p-2" />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">2.4MB</span>
                            <span className="text-xs bg-emerald-100 text-emerald-600 font-bold px-2 py-0.5 rounded-full">320KB</span>
                          </div>
                        </div>
                      ) : tool.previewType === "format" ? (
                        <div className="relative h-full flex items-center justify-center">
                          <img src={(tool as {preview?: string}).preview} alt="Preview" className="h-full w-full object-contain p-2" />
                          <div className="absolute bottom-2 left-2 flex gap-1">
                            {["PNG", "JPG", "WEBP"].map((f, fi) => (
                              <span key={f} className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${fi === 2 ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-500"}`}>{f}</span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <img src={(tool as {preview?: string}).preview} alt="Preview" className="h-full w-full object-contain p-2" />
                        </div>
                      )}
                    </div>

                    <h3 className="text-xl font-semibold mb-2">{tool.name}</h3>
                    <p className="text-muted-foreground text-sm mb-6">{tool.description}</p>

                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 group-hover:gap-2.5 transition-all duration-200">
                      Open Tool <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* AI Upsell */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-16"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-10 text-white text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Want studio-quality product photos?
            </h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Explore AI Product Photography — generate lifestyle shots, white backgrounds, AI models, and more.
            </p>
            <Link
              href="/ai-photography"
              className="inline-flex items-center gap-2 bg-white text-violet-700 font-semibold px-6 py-3 rounded-full hover:bg-white/90 transition-colors"
            >
              Explore AI Photography <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
