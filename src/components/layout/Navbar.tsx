import Link from "next/link";
import { Image as ImageIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/20 glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <ImageIcon className="w-5 h-5 text-white" />
          </div>
          <Link href="/" className="font-semibold text-lg tracking-tight">
            Ecom Image Toolkit
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
          <Link href="#features" className="hover:text-primary transition-colors flex items-center gap-1">
            Features <ChevronDown className="w-4 h-4 opacity-50" />
          </Link>
          <Link href="/tools" className="hover:text-primary transition-colors">
            Free Tools
          </Link>
          <Link href="/pricing" className="hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="/blog" className="hover:text-primary transition-colors">
            Blog
          </Link>
          <Link href="#resources" className="hover:text-primary transition-colors flex items-center gap-1">
            Resources <ChevronDown className="w-4 h-4 opacity-50" />
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-sm font-medium hover:text-primary hidden sm:block">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button variant="default" size="sm">Get Started Free</Button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </nav>
  );
}
