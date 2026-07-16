"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { blogPosts, categories } from "@/lib/blog-data";
import { ArrowRight, Clock } from "lucide-react";

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.06, ease: "easeOut" } }),
};

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? blogPosts
    : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-14">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Badge variant="purple" className="mb-4">Blog</Badge>
          </motion.div>
          <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Resources for E-commerce Sellers
          </motion.h1>
          <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
            className="text-lg text-muted-foreground max-w-xl mx-auto">
            Tips, guides, and strategies to help you optimize your product images and grow on every marketplace.
          </motion.p>
        </div>

        {/* Category Filter */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
          className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat
                  ? "bg-violet-600 text-white border-violet-600"
                  : "border-border hover:border-violet-300 hover:text-violet-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Featured Post */}
        {activeCategory === "All" && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="mb-10">
            <Link href={`/blog/${blogPosts[0].slug}`} className="block group">
              <div className="glass-card p-8 md:p-12 hover:shadow-[0_20px_60px_rgb(124,58,237,0.12)] transition-all duration-300 hover:-translate-y-1">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">{blogPosts[0].category}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {blogPosts[0].readTime}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-violet-600 transition-colors">
                      {blogPosts[0].title}
                    </h2>
                    <p className="text-muted-foreground mb-6">{blogPosts[0].excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">By {blogPosts[0].author} · {blogPosts[0].date}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 group-hover:gap-2 transition-all">
                        Read Article <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                  <div className="text-8xl">{blogPosts[0].emoji}</div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Post Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeCategory === "All" ? filtered.slice(1) : filtered).map((post, i) => (
            <motion.div
              key={post.slug}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={i * 0.07 + 0.4}
            >
              <Link href={`/blog/${post.slug}`} className="block group h-full">
                <div className="glass-card p-6 h-full hover:shadow-[0_16px_48px_rgb(124,58,237,0.1)] transition-all duration-300 hover:-translate-y-1">
                  <div className="text-5xl mb-4">{post.emoji}</div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">{post.category}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {post.readTime}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-violet-600 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">{post.author} · {post.date}</span>
                    <ArrowRight className="w-4 h-4 text-violet-400 group-hover:text-violet-600 transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No posts in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
