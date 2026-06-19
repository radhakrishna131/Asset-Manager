import { ReactNode } from "react";
import { Link } from "wouter";
import { Search, Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";

export function Layout({ children }: { children: ReactNode }) {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold tracking-widest uppercase text-foreground">
              Curation
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/products" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase">
                Products
              </Link>
              <Link href="/deals" className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase">
                Deals
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <Link href="/products" className="text-muted-foreground hover:text-foreground p-2 transition-colors">
              <Search className="w-4 h-4" />
            </Link>
            <Link href="/wishlist" className="relative text-muted-foreground hover:text-foreground p-2 transition-colors">
              <Heart className="w-4 h-4" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-foreground rounded-full" />
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-border/60 py-10 mt-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <span className="tracking-widest uppercase font-medium">Curation</span>
          <span>&copy; {new Date().getFullYear()} — A curated product discovery platform for India</span>
          <Link href="/admin" className="hover:text-foreground transition-colors tracking-wide uppercase">
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
