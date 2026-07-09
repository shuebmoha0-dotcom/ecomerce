"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Scissors, Move, Archive, Zap, RefreshCw, Star, 
  ArrowRight, Sparkles, CheckCircle2, Package, Search
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const tools = [
  {
    icon: Scissors,
    name: "Background Remover",
    description: "Remove backgrounds instantly with AI. Get clean, transparent PNGs ready for any marketplace.",
    href: "/tools/remove-background",
    color: "from-violet-500 to-purple-600",
    lightColor: "bg-violet-50",
    image: "/sample-handbag.png",
    imageBg: "checkerboard",
  },
  {
    icon: Move,
    name: "Marketplace Image Resizer",
    description: "One click. Perfect sizes for Shopify, Amazon, Etsy, eBay & TikTok Shop.",
    href: "/tools/resize",
    color: "from-blue-500 to-cyan-500",
    lightColor: "bg-blue-50",
    image: "/sample-sneaker.png",
    imageBg: "white",
  },
  {
    icon: Archive,
    name: "Image Compressor",
    description: "Reduce file size while maintaining quality. Faster load times, better conversions.",
    href: "/tools/compress",
    color: "from-emerald-500 to-teal-500",
    lightColor: "bg-emerald-50",
    image: "/sample-perfume.png",
    imageBg: "white",
  },
  {
    icon: RefreshCw,
    name: "Format Converter",
    description: "Convert between PNG, JPG, WEBP and AVIF. Pick the best format for every platform.",
    href: "/tools/convert",
    color: "from-orange-500 to-amber-500",
    lightColor: "bg-orange-50",
    image: "/sample-watch.png",
    imageBg: "white",
  },
  {
    icon: Package,
    name: "Bulk Image Processor",
    description: "Upload up to 50 images and process them all in one click. Download individually or as a ZIP.",
    href: "/tools/bulk",
    color: "from-indigo-500 to-blue-600",
    lightColor: "bg-indigo-50",
    image: "/sample-sneaker.png",
    imageBg: "white",
  },
  {
    icon: Search,
    name: "Photo Quality Checker",
    description: "Analyze your product image and get a marketplace-readiness score with actionable tips.",
    href: "/tools/quality-check",
    color: "from-fuchsia-500 to-pink-600",
    lightColor: "bg-fuchsia-50",
    image: "/sample-handbag.png",
    imageBg: "white",
  },
  {
    icon: Zap,
    name: "Image Upscaler",
    description: "Increase resolution by 2× or 4× using high-quality AI upscaling.",
    href: "/tools/upscale",
    color: "from-blue-500 to-indigo-500",
    lightColor: "bg-blue-50",
    image: "/sample-perfume.png",
    imageBg: "white",
  },
];

const marketplaces = [
  { name: "Shopify", color: "text-[#96bf48]" },
  { name: "Amazon", color: "text-[#ff9900]" },
  { name: "Etsy", color: "text-[#f16521]" },
  { name: "eBay", color: "text-[#e53238]" },
  { name: "TikTok Shop", color: "text-black" },
  { name: "WooCommerce", color: "text-[#7f54b3]" },
];

const stats = [
  { value: "100K+", label: "Sellers Served" },
  { value: "5M+", label: "Images Processed" },
  { value: "< 5s", label: "Average Processing" },
  { value: "Free", label: "Core Tools" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        {/* Background gradient blob */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-gradient-to-b from-violet-100/60 to-transparent blur-3xl" />

        <div className="relative container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                <Badge variant="purple" className="mb-6 text-sm px-4 py-1 gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  #1 Image Toolkit for E-commerce Sellers
                </Badge>
              </motion.div>

              <motion.h1
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={1}
                className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-6"
              >
                Everything your product
                <br />
                <span className="text-gradient">images need</span> before
                <br />
                they go live.
              </motion.h1>

              <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={2}
                className="text-lg text-muted-foreground max-w-xl mb-10"
              >
                Remove backgrounds, resize for every marketplace, compress, optimize
                and prepare product images in seconds.
              </motion.p>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={3}
                className="flex flex-col sm:flex-row gap-3 mb-12"
              >
                <Button size="lg" asChild>
                  <Link href="/tools">
                    Use Free Tools <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="glass" className="border border-border bg-white hover:bg-gray-50" asChild>
                  <Link href="/ai-photography">
                    <Sparkles className="mr-2 w-4 h-4 text-violet-500" />
                    Explore AI Product Photography
                  </Link>
                </Button>
              </motion.div>

              {/* Marketplace logos */}
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
                <p className="text-xs text-muted-foreground mb-4 uppercase tracking-widest font-medium">
                  Trusted by sellers on
                </p>
                <div className="flex flex-wrap items-center gap-5 md:gap-8">
                  {marketplaces.map((m) => (
                    <span key={m.name} className={`text-sm font-bold ${m.color} opacity-70 hover:opacity-100 transition-opacity`}>
                      {m.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: Before / After visual */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <div className="glass-card p-6 shadow-[0_30px_80px_rgb(124,58,237,0.15)]">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {/* Before */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Before</p>
                    <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-square">
                      <img
                        src="/sample-lifestyle.png"
                        alt="Product before background removal"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* After */}
                  <div>
                    <p className="text-xs font-medium text-violet-600 mb-2 text-center font-semibold">After ✨</p>
                    <div
                      className="rounded-2xl overflow-hidden aspect-square"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23f3f4f6'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23f3f4f6'/%3E%3C/svg%3E\")", backgroundSize: "16px 16px" }}
                    >
                      <img
                        src="/sample-handbag.png"
                        alt="Product after background removal"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Tool pills */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Remove BG", color: "bg-violet-100 text-violet-700" },
                    { label: "Resize", color: "bg-blue-100 text-blue-700" },
                    { label: "Compress", color: "bg-emerald-100 text-emerald-700" },
                    { label: "Convert", color: "bg-orange-100 text-orange-700" },
                  ].map((t) => (
                    <span key={t.label} className={`text-xs font-semibold px-3 py-1 rounded-full ${t.color}`}>
                      {t.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 glass rounded-2xl px-4 py-2 shadow-lg border border-white/40 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium">AI Powered. Seller Approved.</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* Stats */}
      <section className="border-y border-border py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <motion.div
                key={s.value}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.1}
              >
                <div className="text-3xl font-bold text-gradient">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Powerful tools. 100% free to start.
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              All the image tools you need to prepare, optimize and publish with confidence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.name}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i * 0.1}
                >
                  <Link href={tool.href} className="block group h-full">
                    <div className="glass-card p-8 h-full hover:shadow-[0_16px_48px_rgb(124,58,237,0.12)] transition-all duration-300 hover:-translate-y-1">
                      <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${tool.color} mb-6`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {/* Sample product image preview */}
                      <div
                        className="rounded-2xl h-40 mb-6 overflow-hidden border border-gray-100 flex items-center justify-center"
                        style={tool.imageBg === "checkerboard" ? {
                          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23f3f4f6'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23f3f4f6'/%3E%3C/svg%3E\")",
                          backgroundSize: "16px 16px"
                        } : { backgroundColor: "#f9fafb" }}
                      >
                        <img
                          src={tool.image}
                          alt={tool.name + " sample"}
                          className="h-full w-full object-contain p-3"
                        />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{tool.name}</h3>
                      <p className="text-muted-foreground mb-6">{tool.description}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 group-hover:gap-2 transition-all">
                        Open Tool <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild className="rounded-full border-border">
              <Link href="/tools">View All Tools</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Photography Upsell Banner */}
      <section className="py-20 mx-4 md:mx-auto max-w-7xl w-[calc(100%-2rem)] md:w-full">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-12 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <Badge className="bg-white/20 text-white border-white/20 mb-4">
                <Sparkles className="w-3 h-3 mr-1" /> Premium Feature
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Want studio-quality product photos?
              </h2>
              <p className="text-white/80 text-lg max-w-lg mb-6">
                Generate white-background, lifestyle, and luxury studio shots with AI. No photoshoot needed.
              </p>
              <ul className="space-y-2">
                {["Studio & lifestyle photos", "AI models holding your product", "Multiple backgrounds & angles", "Bulk generation", "Commercial license"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-white/90 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-white/70" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-shrink-0">
              <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90 shadow-xl" asChild>
                <Link href="/ai-photography">
                  Explore AI Photography <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <p className="text-white/60 text-xs mt-3 text-center">Starting at just $9/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: "🔒", title: "Secure & Private", desc: "Images are processed locally or deleted immediately. We never store your photos." },
              { icon: "⚡", title: "Blazing Fast", desc: "AI-powered tools that process images in seconds, not minutes." },
              { icon: "🆓", title: "Free to Start", desc: "Core image tools are completely free. Upgrade anytime for more power." },
            ].map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}>
                <div className="glass-card p-8">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Start preparing images for free
            </h2>
            <p className="text-muted-foreground mb-8">
              No account required. Just upload, process, and download.
            </p>
            <Button size="lg" asChild>
              <Link href="/tools">Get Started Free <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
