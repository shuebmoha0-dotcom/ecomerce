import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  emoji: string;
}

export function PlaceholderPage({ title, subtitle, emoji }: PlaceholderPageProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-20">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">{emoji}</div>
        <h1 className="text-3xl font-bold mb-3">{title}</h1>
        <p className="text-muted-foreground mb-8">{subtitle}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
