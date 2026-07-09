import Link from "next/link";
import { ImageIcon } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-white dark:bg-black py-12 mt-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-1.5 rounded-lg">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight">
                Ecom Image Toolkit
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Everything your product images need before they go live.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Tools</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/tools/remove-background" className="hover:text-primary transition-colors">Background Remover</Link></li>
              <li><Link href="/tools/resize" className="hover:text-primary transition-colors">Marketplace Image Resizer</Link></li>
              <li><Link href="/tools/compress" className="hover:text-primary transition-colors">Image Compressor</Link></li>
              <li><Link href="/tools/convert" className="hover:text-primary transition-colors">Format Converter</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/documentation" className="hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="/api-docs" className="hover:text-primary transition-colors">API (Coming Soon)</Link></li>
              <li><Link href="/affiliate" className="hover:text-primary transition-colors">Affiliate Program</Link></li>
              <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Ecom Image Toolkit. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
