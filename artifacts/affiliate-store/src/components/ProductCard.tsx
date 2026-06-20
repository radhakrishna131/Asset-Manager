import { Link } from "wouter";
import { Heart, Star, ArrowRight, Tag, ShoppingBag } from "lucide-react";
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

  const hasDiscount =
    product.discountPercent && product.discountPercent > 0;

  const savings =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : null;

  return (
    <motion.article
      variants={cardVariants}
      className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
    >
      {/* ── Image ── */}
      <div className={`relative overflow-hidden bg-muted ${size === "sm" ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : null}

        {/* Image fallback gradient */}
        {(!product.images || product.images.length === 0) && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: "linear-gradient(145deg, hsl(220,18%,93%) 0%, hsl(220,18%,88%) 100%)" }}
          >
            <ShoppingBag className="w-8 h-8 text-muted-foreground/30" />
          </div>
        )}

        {/* Gradient fade at bottom of image */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Discount badge — top left */}
        {hasDiscount && (
          <div
            className="absolute top-2.5 left-2.5 flex items-center gap-1 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm"
            style={{ background: "#dc2626" }}
          >
            <Tag className="w-2.5 h-2.5" />
            -{product.discountPercent}%
          </div>
        )}

        {/* Heart — top right */}
        <motion.button
          whileTap={{ scale: 0.75 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${
            saved
              ? "bg-red-500 text-white scale-110"
              : "bg-white/90 backdrop-blur-sm text-muted-foreground hover:bg-white hover:text-red-500"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${saved ? "fill-current" : ""}`} />
        </motion.button>
      </div>

      {/* ── Info ── */}
      <div className={`flex flex-col flex-1 ${size === "sm" ? "p-3" : "p-4"}`}>

        {/* Brand + rating row */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 truncate">
            {product.brand || product.store || product.category}
          </span>
          {product.rating ? (
            <div className="flex items-center gap-0.5 shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[10px] font-bold text-amber-600">{product.rating.toFixed(1)}</span>
              {product.reviewCount && size === "md" ? (
                <span className="text-[10px] text-muted-foreground ml-0.5">
                  ({product.reviewCount > 999 ? `${(product.reviewCount / 1000).toFixed(1)}k` : product.reviewCount})
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Product title */}
        <Link href={`/products/${product.id}`}>
          <h3
            className={`font-semibold leading-snug line-clamp-2 mb-3 hover:text-primary transition-colors cursor-pointer ${
              size === "sm" ? "text-xs" : "text-sm"
            }`}
          >
            {product.title}
          </h3>
        </Link>

        {/* Spacer pushes price + CTA to bottom */}
        <div className="flex-1" />

        {/* Price row */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className={`font-bold tracking-tight ${size === "sm" ? "text-sm" : "text-base"}`}>
            {formatPrice(product.price, product.currency)}
          </span>
          {savings && savings > 0 ? (
            <>
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice!, product.currency)}
              </span>
              {size === "md" && (
                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md ml-auto">
                  Save {formatPrice(savings, product.currency)}
                </span>
              )}
            </>
          ) : null}
        </div>

        {/* CTA button */}
        <Link href={`/products/${product.id}`}>
          <div
            className={`w-full rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 group-hover:gap-2.5 cursor-pointer ${
              size === "sm"
                ? "text-[10px] py-2 px-3"
                : "text-xs py-2.5 px-4"
            } bg-primary/8 text-primary hover:bg-primary hover:text-primary-foreground`}
            style={{ background: "hsl(221,65%,95%)", color: "hsl(221,65%,38%)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "hsl(221,65%,38%)";
              (e.currentTarget as HTMLElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "hsl(221,65%,95%)";
              (e.currentTarget as HTMLElement).style.color = "hsl(221,65%,38%)";
            }}
          >
            View Product
            <ArrowRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </motion.article>
  );
}
