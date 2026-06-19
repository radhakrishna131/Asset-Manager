import { ReactNode } from "react";
import { Link } from "wouter";
import { Search, Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";

export function Layout({ children }: { children: ReactNode }) {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter">
              <ShoppingBag className="w-6 h-6 text-primary" />
              <span>Curation</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
              <Link href="/deals" className="hover:text-foreground transition-colors">Deals</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/products" className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/wishlist" className="relative text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted transition-colors">
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-primary text-primary-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-muted/40 py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Curation. A premium discovery platform.</p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="/admin" className="hover:text-foreground">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
