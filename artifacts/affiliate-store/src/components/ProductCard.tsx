import { Link } from "wouter";
import { Heart, Star, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlist } from "@/hooks/use-wishlist";
import { Product } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/format";

export const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export function ProductCard({ product, size = "md" }: { product: Product; size?: "sm" | "md" }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const saved = isInWishlist(product.id);

  return (
    <motion.article
      variants={cardVariants}
      className="group flex flex-col bg-card rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300"
    >
      {/* Image area */}
      <div className={`relative bg-muted overflow-hidden ${size === "sm" ? "aspect-[3/4]" : "aspect-[3/4]"}`}>
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground gap-2">
            <span className="text-2xl">📦</span>
          </div>
        )}

        {/* Heart */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xs transition-all hover:scale-110"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${saved ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
          />
        </motion.button>

        {/* Color swatches (decorative) */}
        {product.discountPercent ? (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1">
            <span className="w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-xs" />
            <span className="w-4 h-4 rounded-full bg-slate-800 border-2 border-white shadow-xs" />
          </div>
        ) : null}
      </div>

      {/* Card content */}
      <div className="p-3.5 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {product.brand || product.store || product.category}
          </p>
          {product.rating ? (
            <div className="ml-auto flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-semibold text-muted-foreground">{product.rating.toFixed(1)}</span>
            </div>
          ) : null}
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className={`font-semibold leading-snug line-clamp-2 hover:text-primary transition-colors ${size === "sm" ? "text-xs" : "text-sm"}`}>
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-1.5 gap-2">
          {/* Original price if discounted */}
          {product.originalPrice && product.originalPrice > product.price ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice, product.currency)}
            </span>
          ) : <div />}

          {/* Blue price pill */}
          <Link href={`/products/${product.id}`}>
            <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-primary/90 transition-colors shrink-0">
              {formatPrice(product.price, product.currency)}
              <ExternalLink className="w-3 h-3 opacity-80" />
            </div>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
