import { blogPosts } from "@/lib/blog-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

const ARTICLE_CONTENT: Record<string, string> = {
  "shopify-product-image-guide": `Your product images are the first thing shoppers see on Shopify. Poor images mean poor sales, regardless of how great your product actually is.\n\n## The Ideal Shopify Image Size\n\nShopify recommends **2048 × 2048px** for product images. This is square, which works across all display themes. The maximum file size is 20MB.\n\n## Formats to Use\n\n- **WEBP**: Best for web performance and SEO\n- **JPG**: Good for product photos\n- **PNG**: Best when you need transparency\n\n## Top Tips\n\n1. Always use a white or neutral background for the main listing image\n2. Show multiple angles — at least 3-5 photos per product\n3. Include a lifestyle shot to show scale and context\n4. Compress images below 200KB for optimal load times\n5. Add descriptive alt text for SEO`,
  "amazon-product-photo-requirements": `Amazon is strict about image requirements — and for good reason. Their A9 algorithm rewards listings with professional, high-quality images.\n\n## Main Image Rules\n\n- **Minimum**: 1000px on the longest side\n- **Recommended**: 2000px on the longest side (enables zoom)\n- **Background**: Pure white (RGB 255, 255, 255)\n- **Format**: JPG or PNG\n- **Product coverage**: At least 85% of the frame\n\n## Common Rejection Reasons\n\n- Watermarks or logos on images\n- Colored or textured backgrounds\n- Product not filling enough of the frame\n- Low resolution\n- Multiple products in frame when listing is for one item\n\n## Tips for Better Rankings\n\nListings with all 7 image slots filled consistently outperform those with fewer images. Use infographics, lifestyle shots, and comparison charts in slots 2–7.`,
  default: `This article is coming soon. Check back for the full guide.\n\nIn the meantime, explore our free image tools to get your product photos ready for any marketplace.`,
};

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) notFound();

  const content = ARTICLE_CONTENT[post.slug] || ARTICLE_CONTENT.default;
  const related = blogPosts.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 2);

  return (
    <div className="py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">{post.category}</span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {post.readTime}
            </span>
          </div>
          <div className="text-6xl mb-6">{post.emoji}</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{post.title}</h1>
          <p className="text-muted-foreground text-lg mb-4">{post.excerpt}</p>
          <p className="text-sm text-muted-foreground">By {post.author} · {post.date}</p>
        </div>

        {/* Content */}
        <div className="glass-card p-8 md:p-12 mb-10">
          <div className="prose prose-zinc max-w-none">
            {content.split("\n\n").map((block, i) => {
              if (block.startsWith("## ")) {
                return <h2 key={i} className="text-2xl font-bold mt-8 mb-3">{block.replace("## ", "")}</h2>;
              }
              if (block.startsWith("- ")) {
                const items = block.split("\n").filter(Boolean);
                return (
                  <ul key={i} className="list-disc list-inside space-y-1.5 mb-4 text-muted-foreground">
                    {items.map((item, j) => (
                      <li key={j}>{item.replace(/^- \*\*(.*?)\*\*: (.*)$/, "$1: $2").replace(/^- /, "")}</li>
                    ))}
                  </ul>
                );
              }
              if (/^\d+\./.test(block)) {
                const items = block.split("\n").filter(Boolean);
                return (
                  <ol key={i} className="list-decimal list-inside space-y-1.5 mb-4 text-muted-foreground">
                    {items.map((item, j) => <li key={j}>{item.replace(/^\d+\. /, "")}</li>)}
                  </ol>
                );
              }
              return <p key={i} className="text-muted-foreground mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />;
            })}
          </div>
        </div>

        {/* Tool CTA */}
        <div className="rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Ready to optimize your product images?</h2>
          <p className="text-white/80 mb-5">Use our free tools to remove backgrounds, resize, compress and convert your images.</p>
          <Link href="/tools" className="inline-flex items-center gap-2 bg-white text-violet-700 font-semibold px-6 py-3 rounded-full hover:bg-white/90 transition-colors">
            Try Free Tools <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-5">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((rp) => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`} className="block group">
                  <div className="glass-card p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                    <div className="text-3xl mb-3">{rp.emoji}</div>
                    <h3 className="font-semibold group-hover:text-violet-600 transition-colors text-sm leading-snug">{rp.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{rp.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
