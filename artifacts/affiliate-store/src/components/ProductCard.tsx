import { Link } from "wouter";
import { Heart, Star, Store, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlist } from "@/hooks/use-wishlist";
import { Product } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";

export const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const saved = isInWishlist(product.id);

  return (
    <motion.div
      variants={cardVariants}
      className="group relative flex flex-col bg-card rounded-2xl border border-card-border overflow-hidden transition-shadow duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.10)]"
    >
      <div className="relative aspect-[4/3] bg-muted/30 overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <Store className="w-8 h-8 opacity-30" />
            <span className="text-sm opacity-50">No image</span>
          </div>
        )}

        {product.discountPercent ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-3 left-3"
          >
            <Badge variant="destructive" className="font-bold text-xs px-2.5 py-1 shadow-sm">
              {product.discountPercent}% OFF
            </Badge>
          </motion.div>
        ) : null}

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 shadow-sm
            ${saved
              ? "bg-primary text-primary-foreground scale-110"
              : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground hover:scale-110"
            }`}
        >
          <Heart className={`w-4 h-4 transition-all duration-200 ${saved ? "fill-current" : ""}`} />
        </motion.button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate">
            <Store className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{product.store || product.brand || "Unknown"}</span>
          </div>
          {product.rating ? (
            <div className="flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 px-1.5 py-0.5 rounded-md shrink-0">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          ) : null}
        </div>

        <Link href={`/products/${product.id}`} className="block mb-4">
          <h3 className="font-bold text-base leading-snug line-clamp-2 hover:text-primary/80 transition-colors duration-150">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-bold tracking-tight text-foreground">
              {formatPrice(product.price, product.currency)}
            </div>
            {product.originalPrice && product.originalPrice > product.price ? (
              <div className="text-xs text-muted-foreground line-through mt-0.5">
                {formatPrice(product.originalPrice, product.currency)}
              </div>
            ) : null}
          </div>

          <Link href={`/products/${product.id}`}>
            <Button size="sm" className="rounded-full font-semibold shrink-0 shadow-sm">
              Details <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
