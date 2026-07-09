"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started.",
    badge: null,
    cta: "Get Started Free",
    ctaHref: "/tools",
    features: [
      { text: "Background Remover (5/day)", included: true },
      { text: "Image Resizer (unlimited)", included: true },
      { text: "Image Compressor (unlimited)", included: true },
      { text: "Format Converter (unlimited)", included: true },
      { text: "AI Product Photography", included: false },
      { text: "Bulk processing", included: false },
      { text: "Priority processing", included: false },
      { text: "Commercial license", included: false },
    ],
    highlight: false,
  },
  {
    name: "Starter",
    price: "$9",
    period: "per month",
    description: "For individual sellers scaling up.",
    badge: null,
    cta: "Start Starter Plan",
    ctaHref: "/signup",
    features: [
      { text: "Background Remover (100/mo)", included: true },
      { text: "Image Resizer (unlimited)", included: true },
      { text: "Image Compressor (unlimited)", included: true },
      { text: "Format Converter (unlimited)", included: true },
      { text: "AI Product Photography (20/mo)", included: true },
      { text: "Bulk processing (up to 10)", included: true },
      { text: "Priority processing", included: false },
      { text: "Commercial license", included: true },
    ],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For growing e-commerce businesses.",
    badge: "Most Popular",
    cta: "Start Pro Plan",
    ctaHref: "/signup",
    features: [
      { text: "Background Remover (500/mo)", included: true },
      { text: "Image Resizer (unlimited)", included: true },
      { text: "Image Compressor (unlimited)", included: true },
      { text: "Format Converter (unlimited)", included: true },
      { text: "AI Product Photography (100/mo)", included: true },
      { text: "Bulk processing (up to 100)", included: true },
      { text: "Priority processing", included: true },
      { text: "Commercial license", included: true },
    ],
    highlight: true,
  },
  {
    name: "Business",
    price: "$79",
    period: "per month",
    description: "For agencies and large catalogs.",
    badge: null,
    cta: "Start Business Plan",
    ctaHref: "/signup",
    features: [
      { text: "Background Remover (unlimited)", included: true },
      { text: "Image Resizer (unlimited)", included: true },
      { text: "Image Compressor (unlimited)", included: true },
      { text: "Format Converter (unlimited)", included: true },
      { text: "AI Product Photography (500/mo)", included: true },
      { text: "Bulk processing (unlimited)", included: true },
      { text: "Priority processing", included: true },
      { text: "Commercial license", included: true },
    ],
    highlight: false,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08, ease: "easeOut" } }),
};

export default function PricingPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Badge variant="purple" className="mb-4">Pricing</Badge>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg text-muted-foreground max-w-xl mx-auto">
            Start for free. Upgrade when you are ready for more power.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={i * 0.1 + 0.2}
            >
              <div className={`flex flex-col h-full rounded-3xl border p-6 ${
                plan.highlight
                  ? "bg-gradient-to-b from-violet-600 to-indigo-700 text-white border-transparent shadow-[0_20px_60px_rgb(124,58,237,0.3)]"
                  : "glass-card"
              }`}>
                {plan.badge && (
                  <div className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4 ${
                    plan.highlight ? "bg-white/20 text-white" : "bg-violet-100 text-violet-700"
                  }`}>
                    {plan.badge}
                  </div>
                )}
                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-white" : ""}`}>{plan.name}</h3>
                <p className={`text-sm mb-4 ${plan.highlight ? "text-white/70" : "text-muted-foreground"}`}>{plan.description}</p>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : ""}`}>{plan.price}</span>
                  <span className={`text-sm ml-1 ${plan.highlight ? "text-white/70" : "text-muted-foreground"}`}>/{plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-2 text-sm">
                      {f.included ? (
                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-white/80" : "text-green-500"}`} />
                      ) : (
                        <X className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-white/30" : "text-gray-300"}`} />
                      )}
                      <span className={f.included ? (plan.highlight ? "text-white/90" : "") : (plan.highlight ? "text-white/40" : "text-muted-foreground")}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={plan.highlight ? "bg-white text-violet-700 hover:bg-white/90" : ""}
                  variant={plan.highlight ? undefined : "outline"}
                >
                  <Link href={plan.ctaHref}>{plan.cta}</Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Do I need a credit card to start?", a: "No. The free plan requires no credit card. Just sign up and start using the tools." },
              { q: "Can I cancel anytime?", a: "Yes. Cancel anytime from your account settings. No questions asked." },
              { q: "Are images processed on my device?", a: "For the background remover and compressor, images are processed locally in your browser for privacy. No data is sent to our servers." },
              { q: "What's included in the commercial license?", a: "You can use all generated and processed images for any commercial purpose including marketplace listings, ads, and social media." },
            ].map((faq) => (
              <div key={faq.q} className="glass-card p-6">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
