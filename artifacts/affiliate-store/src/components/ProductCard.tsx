import { Link } from "wouter";
import { Heart, Star, Store, ArrowUpRight } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { Product } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const saved = isInWishlist(product.id);

  return (
    <div className="group relative flex flex-col bg-card rounded-xl border border-card-border overflow-hidden hover-elevate transition-all duration-300">
      <div className="relative aspect-[4/3] bg-muted/30 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        
        {product.discountPercent ? (
          <Badge variant="destructive" className="absolute top-3 left-3 font-bold">
            {product.discountPercent}% OFF
          </Badge>
        ) : null}

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all shadow-sm
            ${saved ? "bg-primary text-primary-foreground" : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground"}`}
        >
          <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
            <Store className="w-3.5 h-3.5" />
            <span>{product.store || product.brand || 'Unknown Store'}</span>
          </div>
          {product.rating ? (
            <div className="flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 px-1.5 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          ) : null}
        </div>

        <Link href={`/products/${product.id}`} className="block mb-4">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="text-xl font-bold tracking-tight">
              {product.currency || '$'}{product.price.toFixed(2)}
            </div>
            {product.originalPrice && product.originalPrice > product.price ? (
              <div className="text-sm text-muted-foreground line-through">
                {product.currency || '$'}{product.originalPrice.toFixed(2)}
              </div>
            ) : null}
          </div>
          
          <Link href={`/products/${product.id}`}>
            <Button size="sm" className="rounded-full font-medium">
              Details <ArrowUpRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
