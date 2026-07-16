"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles, Camera, Zap, Globe, Heart } from "lucide-react";

const styles = [
  { name: "White Background", desc: "Clean, professional product shots on pure white", icon: "⚪", image: "/sample-handbag.png" },
  { name: "Lifestyle Photos", desc: "Product in real-life contexts and environments", icon: "🏠", image: "/sample-lifestyle.png" },
  { name: "Luxury Studio", desc: "Premium dark or textured backgrounds with dramatic lighting", icon: "✨", image: "/sample-perfume.png" },
  { name: "Holiday Campaigns", desc: "Seasonal and festive product photography", icon: "🎄", image: "/sample-candle.png" },
  { name: "AI Model Holding Product", desc: "Diverse AI models presenting your products", icon: "🧍", image: "/sample-watch.png" },
  { name: "Multiple Angles", desc: "360° views and various perspectives", icon: "🔄", image: "/sample-sneaker.png" },
];

const features = [
  { icon: Camera, title: "Studio-Quality Results", desc: "Professional grade photos without the studio costs" },
  { icon: Zap, title: "Instant Generation", desc: "Get results in seconds, not days" },
  { icon: Globe, title: "Commercial License", desc: "Use images on any marketplace or platform" },
  { icon: Heart, title: "Bulk Generation", desc: "Process hundreds of products at once" },
];

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08, ease: "easeOut" } }),
};

export default function AIPhotographyPage() {
  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Badge variant="purple" className="mb-4 gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Premium Feature
            </Badge>
          </motion.div>
          <motion.h1
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-5xl md:text-6xl font-bold tracking-tight mb-6"
          >
            Studio-quality product photos
            <br />
            <span className="text-gradient">powered by AI</span>
          </motion.h1>
          <motion.p
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Generate professional product photos in any style — white backgrounds, lifestyle shots, 
            luxury studio, and AI models — in seconds.
          </motion.p>
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg">
              Get Started — $9/month <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-border">
              View Gallery
            </Button>
          </motion.div>
        </div>

        {/* Photo Style Grid */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-10">Every photo style you need</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {styles.map((style, i) => (
              <motion.div
                key={style.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.05}
              >
                <div className="glass-card overflow-hidden hover:shadow-[0_16px_48px_rgb(124,58,237,0.1)] transition-all duration-300 hover:-translate-y-1 h-full group">
                  <div className="h-48 bg-gray-50 overflow-hidden relative">
                    <img
                      src={style.image}
                      alt={style.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 text-2xl">{style.icon}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-1">{style.name}</h3>
                    <p className="text-muted-foreground text-sm">{style.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Gallery Strip */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mb-20"
        >
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {["/sample-handbag.png", "/sample-perfume.png", "/sample-sneaker.png", "/sample-lifestyle.png", "/sample-watch.png", "/sample-candle.png"].map((img, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group">
                <img src={img} alt="AI product photo" className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-3">Sample AI-generated product photos — ready to publish in seconds</p>
        </motion.div>

        {/* Upload Demo Area */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-20">
          <div className="glass-card p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <Badge variant="purple" className="mb-4">Premium</Badge>
                <h2 className="text-3xl font-bold mb-4">Generate in 3 steps</h2>
                <ol className="space-y-4">
                  {[
                    { step: "1", title: "Upload your product photo", desc: "Any angle, any background — we handle the rest." },
                    { step: "2", title: "Choose your style & settings", desc: "Select background, lighting, model, and more." },
                    { step: "3", title: "Download high-res photos", desc: "Get commercial-license images ready to publish." },
                  ].map((item) => (
                    <li key={item.step} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <Button className="mt-8" size="lg">
                  Start Generating — $9/mo <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
              
              <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 p-8 text-center">
                <div className="border-2 border-dashed border-violet-200 rounded-2xl p-12 hover:border-violet-400 transition-colors cursor-pointer group">
                  <div className="inline-flex p-4 rounded-2xl bg-violet-100 mb-4 group-hover:bg-violet-200 transition-colors">
                    <Camera className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Upload your product</h3>
                  <p className="text-muted-foreground text-sm mb-4">PNG, JPG, WEBP accepted</p>
                  <div className="inline-flex items-center gap-2 bg-violet-600 text-white text-sm font-medium px-4 py-2 rounded-full">
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">
                    Upgrade to Premium to unlock
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.1}>
                  <div className="glass-card p-6 text-center">
                    <div className="inline-flex p-3 rounded-2xl bg-violet-100 mb-4">
                      <Icon className="w-6 h-6 text-violet-600" />
                    </div>
                    <h3 className="font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Banner */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-16 text-white text-center">
            <Sparkles className="w-10 h-10 mx-auto mb-6 opacity-70" />
            <h2 className="text-4xl font-bold mb-4">Ready to upgrade your product images?</h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
              Join thousands of sellers generating studio-quality product photos with AI.
            </p>
            <Button size="lg" className="bg-white text-violet-700 hover:bg-white/90">
              Get Started for $9/month <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <p className="text-white/60 text-sm mt-4">Cancel anytime. Commercial license included.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
