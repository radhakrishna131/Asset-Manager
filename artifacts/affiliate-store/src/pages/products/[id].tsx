import { useState } from "react";
import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetProduct, getGetProductQueryKey, useTrackProductClick } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Store, ExternalLink, Heart, Check, Info, ChevronLeft } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/format";
import { Link } from "wouter";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const id = parseInt(params?.id || "0", 10);

  const { data: product, isLoading } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) }
  });

  const trackClick = useTrackProductClick();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [activeImage, setActiveImage] = useState(0);

  const handleBuyClick = () => {
    if (!product) return;
    trackClick.mutate({ id: product.id }, {
      onSettled: () => {
        window.open(product.affiliateUrl, "_blank");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-6 pt-4">
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-14 w-48 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link href="/products">
          <Button variant="outline" className="mt-6">Browse Products</Button>
        </Link>
      </div>
    );
  }

  const saved = isInWishlist(product.id);
  const images = product.images?.length ? product.images : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="container mx-auto px-4 py-10"
    >
      <Link href="/products">
        <Button variant="ghost" size="sm" className="mb-8 text-muted-foreground hover:text-foreground -ml-2">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Products
        </Button>
      </Link>

      <div className="grid lg:grid-cols-2 gap-12 items-start">

        {/* Gallery */}
        <div className="space-y-4 sticky top-24">
          <div className="aspect-square rounded-3xl overflow-hidden bg-muted/30 border">
            <AnimatePresence mode="wait">
              {images.length > 0 ? (
                <motion.img
                  key={activeImage}
                  src={images[activeImage]}
                  alt={product.title}
                  initial={{ opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Store className="w-16 h-16 opacity-20" />
                </div>
              )}
            </AnimatePresence>
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 px-1">
              {images.map((img, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    activeImage === i
                      ? "border-primary ring-2 ring-primary/20 ring-offset-2"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col"
        >
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="px-3 py-1 font-medium bg-muted/50 rounded-full capitalize">
              {product.category}
            </Badge>
            {product.discountPercent ? (
              <Badge variant="destructive" className="px-3 py-1 font-bold rounded-full">
                {product.discountPercent}% OFF
              </Badge>
            ) : null}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-5 leading-[1.15]">
            {product.title}
          </h1>

          <div className="flex items-center gap-5 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
              <Store className="w-4 h-4" />
              <span>{product.store || product.brand || "Unknown Store"}</span>
            </div>
            {product.rating ? (
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 px-2.5 py-1 rounded-lg font-bold text-sm">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating.toFixed(1)}</span>
                {product.reviewCount ? (
                  <span className="opacity-60 font-medium ml-0.5">({product.reviewCount.toLocaleString("en-IN")})</span>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Price */}
          <div className="mb-8">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-bold tracking-tighter">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.originalPrice && product.originalPrice > product.price ? (
                <span className="text-lg text-muted-foreground line-through mb-1 font-medium">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
              ) : null}
            </div>
            {product.discountPercent ? (
              <div className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1.5">
                You save {formatPrice(
                  (product.originalPrice ?? product.price) - product.price,
                  product.currency
                )} ({product.discountPercent}%)
              </div>
            ) : null}
            {product.inStock !== false ? (
              <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                <Check className="w-4 h-4" /> In Stock
              </div>
            ) : (
              <div className="text-sm font-medium text-destructive">Out of Stock</div>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12">
            <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                className="w-full h-14 text-base font-bold rounded-2xl shadow-lg shadow-primary/20"
                onClick={handleBuyClick}
              >
                Buy Now on {product.store || "Store"} <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                variant={saved ? "secondary" : "outline"}
                className={`h-14 px-8 rounded-2xl border-2 ${saved ? "border-transparent" : "border-border"}`}
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart className={`w-5 h-5 mr-2 transition-all ${saved ? "fill-current text-primary" : ""}`} />
                {saved ? "Saved" : "Save"}
              </Button>
            </motion.div>
          </div>

          {/* Description */}
          {product.description && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mb-10"
            >
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" /> About this product
              </h3>
              <div className="text-muted-foreground text-sm leading-relaxed space-y-2">
                {product.description.split("\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="text-base font-bold mb-4">Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} className="bg-muted/40 p-3.5 rounded-xl border">
                    <div className="text-xs text-muted-foreground mb-1 font-medium capitalize">
                      {k.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                    <div className="font-semibold text-sm">{String(v)}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
