import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Zap, Shirt, BookOpen, Sparkles, Activity, Home, ShoppingBasket, Watch,
  Heart, Settings, Menu, X, Monitor, Gift, ChevronRight, Package
} from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { LucideIcon } from "lucide-react";
import { Footer } from "@/components/Footer";

const categoryIconMap: Record<string, LucideIcon> = {
  electronics: Monitor,
  fashion: Shirt,
  books: BookOpen,
  beauty: Sparkles,
  sports: Activity,
  "home-living": Home,
  "home": Home,
  grocery: ShoppingBasket,
  accessories: Watch,
  gifts: Gift,
};

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  badge?: number;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}>
      <div
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
          active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="truncate flex-1">{label}</span>
        {badge ? (
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full leading-none ${
            active ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
          }`}>
            {badge}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const [location] = useLocation();
  const { wishlist } = useWishlist();

  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });

  const catParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "").get("category");

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/60">
        <Link href="/" onClick={onNav}>
          <span className="text-lg font-bold tracking-tight text-foreground">Curation</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 mb-2">Browse</p>

        <NavItem
          href="/"
          icon={Zap}
          label="Explore New"
          active={location === "/"}
          onClick={onNav}
        />
        <NavItem
          href="/deals"
          icon={Sparkles}
          label="Today's Deals"
          active={location === "/deals"}
          onClick={onNav}
        />

        {categories && categories.length > 0 && (
          <>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 pt-4 pb-1">Categories</p>
            {categories.map((cat) => {
              const Icon = categoryIconMap[cat.slug] || Package;
              const isActive = location === "/products" && catParams === cat.slug;
              return (
                <NavItem
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  icon={Icon}
                  label={cat.name}
                  active={isActive}
                  badge={cat.productCount > 0 ? cat.productCount : undefined}
                  onClick={onNav}
                />
              );
            })}
          </>
        )}

        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-3 pt-4 pb-1">Quick Links</p>
        <NavItem
          href="/products"
          icon={Package}
          label="All Products"
          active={location === "/products" && !catParams}
          onClick={onNav}
        />
        <NavItem
          href="/wishlist"
          icon={Heart}
          label="Wishlist"
          active={location === "/wishlist"}
          badge={wishlist.length > 0 ? wishlist.length : undefined}
          onClick={onNav}
        />
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-border/60 space-y-1">
        <NavItem href="/admin" icon={Settings} label="Admin" onClick={onNav} />
      </div>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-56 p-0 bg-card">
          <SidebarContent onNav={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-52 flex-col bg-card border-r border-border/60 shrink-0 overflow-hidden">
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 bg-card border-b border-border/60 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/">
            <span className="font-bold text-base">Curation</span>
          </Link>
          <Link href="/wishlist" className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <Heart className="w-5 h-5" />
          </Link>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
