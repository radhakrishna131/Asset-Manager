import { useState } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetProduct, getGetProductQueryKey, useTrackProductClick } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ExternalLink, Heart, Check, ArrowLeft } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/format";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const id = parseInt(params?.id || "0", 10);

  const { data: product, isLoading } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) },
  });

  const trackClick = useTrackProductClick();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [activeImage, setActiveImage] = useState(0);

  const handleBuyClick = () => {
    if (!product) return;
    trackClick.mutate({ id: product.id }, {
      onSettled: () => window.open(product.affiliateUrl, "_blank"),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-16">
          <Skeleton className="aspect-square" />
          <div className="space-y-6 pt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-11 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        <p className="text-sm text-muted-foreground">Product not found.</p>
        <Link href="/products">
          <span className="mt-4 inline-block text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors">
            Back to products
          </span>
        </Link>
      </div>
    );
  }

  const saved = isInWishlist(product.id);
  const images = product.images?.length ? product.images : [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="max-w-6xl mx-auto px-6 py-10"
    >
      <Link href="/products">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-10 uppercase tracking-wider font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Products
        </span>
      </Link>

      <div className="grid lg:grid-cols-2 gap-16 items-start">

        {/* Gallery */}
        <div className="space-y-3 sticky top-20">
          <div className="aspect-square bg-muted overflow-hidden">
            <AnimatePresence mode="wait">
              {images.length > 0 ? (
                <motion.img
                  key={activeImage}
                  src={images[activeImage]}
                  alt={product.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-xs tracking-widest uppercase text-muted-foreground">No image</span>
                </div>
              )}
            </AnimatePresence>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 overflow-hidden transition-all duration-200 ${
                    activeImage === i ? "ring-1 ring-foreground ring-offset-1 opacity-100" : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="pt-2"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[10px] tracking-widest uppercase font-medium text-muted-foreground">
              {product.category}
            </span>
            {product.discountPercent ? (
              <span className="bg-foreground text-background text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5">
                -{product.discountPercent}%
              </span>
            ) : null}
          </div>

          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug mb-5">
            {product.title}
          </h1>

          <div className="flex items-center gap-4 pb-6 mb-6 border-b border-border/60 text-xs text-muted-foreground">
            {product.brand && <span className="uppercase tracking-wider font-medium">{product.brand}</span>}
            {product.store && <span>{product.store}</span>}
            {product.rating ? (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-foreground text-foreground" />
                <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
                {product.reviewCount ? <span>({product.reviewCount.toLocaleString("en-IN")} reviews)</span> : null}
              </div>
            ) : null}
          </div>

          {/* Price */}
          <div className="mb-7">
            <div className="flex items-baseline gap-3 mb-1.5">
              <span className="text-3xl font-semibold tracking-tight">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.originalPrice && product.originalPrice > product.price ? (
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
              ) : null}
            </div>
            {product.discountPercent ? (
              <p className="text-xs text-muted-foreground">
                You save {formatPrice((product.originalPrice ?? product.price) - product.price, product.currency)}
              </p>
            ) : null}
            <div className="flex items-center gap-1 mt-2">
              {product.inStock !== false ? (
                <span className="text-xs flex items-center gap-1 text-muted-foreground">
                  <Check className="w-3 h-3" /> In stock
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Out of stock</span>
              )}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex gap-3 mb-10">
            <button
              onClick={handleBuyClick}
              className="flex-1 h-11 bg-foreground text-background text-xs font-semibold tracking-widest uppercase rounded-sm hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
            >
              Buy Now <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`h-11 px-4 border rounded-sm text-xs font-medium transition-all ${
                saved ? "border-foreground text-foreground" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-10">
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-medium mb-3">About</p>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                {product.description.split("\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          )}

          {/* Specs */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-medium mb-4">Specifications</p>
              <div className="divide-y divide-border/60">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between py-2.5 gap-6">
                    <span className="text-xs text-muted-foreground capitalize flex-shrink-0">
                      {k.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-xs font-medium text-right">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
