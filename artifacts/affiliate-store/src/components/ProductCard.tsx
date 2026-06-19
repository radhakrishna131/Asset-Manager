import { Link } from "wouter";
import { Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlist } from "@/hooks/use-wishlist";
import { Product } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/format";

export const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function ProductCard({ product }: { product: Product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const saved = isInWishlist(product.id);

  return (
    <motion.article variants={cardVariants} className="group flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden mb-4">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-xs text-muted-foreground tracking-widest uppercase">No image</span>
          </div>
        )}

        {/* Discount tag */}
        {product.discountPercent ? (
          <div className="absolute top-3 left-3 bg-foreground text-background text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5">
            -{product.discountPercent}%
          </div>
        ) : null}

        {/* Wishlist */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 right-3 p-1.5 transition-all duration-200
            ${saved ? "text-foreground" : "text-foreground/30 hover:text-foreground/70"}`}
        >
          <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
        </motion.button>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] tracking-widest uppercase text-muted-foreground font-medium truncate">
            {product.brand || product.store || product.category}
          </span>
          {product.rating ? (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3 h-3 fill-foreground text-foreground" />
              <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
            </div>
          ) : null}
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-medium leading-snug line-clamp-2 text-foreground hover:text-muted-foreground transition-colors">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-sm font-semibold">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.originalPrice && product.originalPrice > product.price ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.originalPrice, product.currency)}
            </span>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}
