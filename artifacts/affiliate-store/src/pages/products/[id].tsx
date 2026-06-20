import { useState } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetProduct,
  getGetProductQueryKey,
  useTrackProductClick,
  useListProducts,
  getListProductsQueryKey,
  useGetTrendingProducts,
  getGetTrendingProductsQueryKey,
} from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ExternalLink, Heart, Check, ArrowLeft, ShoppingBag, ChevronRight, TrendingUp, LayoutGrid } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { formatPrice } from "@/lib/format";
import { ProductCard, cardVariants } from "@/components/ProductCard";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

function RecommendationSection({ currentId, category }: { currentId: number; category: string }) {
  const { data: categoryData } = useListProducts(
    { category, limit: 7, sort: "popular" as any },
    { query: { queryKey: getListProductsQueryKey({ category, limit: 7, sort: "popular" as any }) } }
  );

  const { data: trendingData } = useGetTrendingProducts(
    { limit: 8 },
    { query: { queryKey: getGetTrendingProductsQueryKey({ limit: 8 }) } }
  );

  const similar = (categoryData?.products ?? []).filter((p) => p.id !== currentId).slice(0, 6);
  const trending = (trendingData ?? []).filter((p) => p.id !== currentId).slice(0, 6);

  const showSimilar = similar.length >= 2;
  const showTrending = trending.length >= 2;

  if (!showSimilar && !showTrending) return null;

  return (
    <div className="mt-12 space-y-10">
      {showSimilar && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 bg-primary rounded-full" />
              <h2 className="text-lg font-bold tracking-tight">More in {category}</h2>
            </div>
            <Link href={`/products?category=${encodeURIComponent(category)}`}>
              <span className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                See all <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          >
            {similar.map((product) => (
              <motion.div key={product.id} variants={cardVariants}>
                <ProductCard product={product} size="sm" />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      {showTrending && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-5 bg-amber-400 rounded-full" />
              <TrendingUp className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-bold tracking-tight">Trending Right Now</h2>
            </div>
            <Link href="/products?sort=popular">
              <span className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                See all <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4"
          >
            {trending.map((product) => (
              <motion.div key={product.id} variants={cardVariants}>
                <ProductCard product={product} size="sm" />
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}
    </div>
  );
}

function RecommendationSkeleton() {
  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-5">
        <Skeleton className="w-1 h-5 rounded-full" />
        <Skeleton className="h-5 w-40 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[3/4] rounded-2xl" />
            <Skeleton className="h-3.5 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

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
      <div className="p-5 md:p-7">
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-5 pt-2">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-12 w-40 rounded-full" />
          </div>
        </div>
        <RecommendationSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-5 md:p-7 text-center py-24">
        <p className="text-muted-foreground mb-4">Product not found.</p>
        <Link href="/products">
          <span className="text-sm font-semibold text-primary hover:underline">Back to products</span>
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
      transition={{ duration: 0.3 }}
      className="p-5 md:p-7"
    >
      <Link href="/products">
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back
        </span>
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 items-start">

        {/* Gallery */}
        <div className="space-y-3 lg:sticky lg:top-6">
          <div className="aspect-square bg-card rounded-2xl overflow-hidden shadow-xs">
            <AnimatePresence mode="wait">
              {images.length > 0 ? (
                <motion.img
                  key={activeImage}
                  src={images[activeImage]}
                  alt={product.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <ShoppingBag className="w-12 h-12 text-muted-foreground opacity-20" />
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
                  className={`w-16 h-16 rounded-xl overflow-hidden transition-all duration-200 ${
                    activeImage === i
                      ? "ring-2 ring-primary ring-offset-2 opacity-100"
                      : "opacity-50 hover:opacity-80"
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
        >
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4">
            <Link href={`/products?category=${encodeURIComponent(product.category)}`}>
              <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full capitalize hover:bg-primary/20 transition-colors cursor-pointer flex items-center gap-1">
                <LayoutGrid className="w-3 h-3" />
                {product.category}
              </span>
            </Link>
            {product.discountPercent ? (
              <span className="text-xs font-bold bg-red-100 text-red-600 px-3 py-1 rounded-full">
                -{product.discountPercent}% off
              </span>
            ) : null}
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-snug mb-4">
            {product.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {(product.brand || product.store) && (
              <span className="text-sm font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {product.brand || product.store}
              </span>
            )}
            {product.rating ? (
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-sm font-bold">{product.rating.toFixed(1)}</span>
                {product.reviewCount ? (
                  <span className="text-xs font-medium opacity-70">
                    ({product.reviewCount.toLocaleString("en-IN")})
                  </span>
                ) : null}
              </div>
            ) : null}
            {product.inStock !== false ? (
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">In Stock</span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full">Out of Stock</span>
            )}
          </div>

          {/* Price */}
          <div className="bg-card rounded-2xl p-5 mb-6 shadow-xs">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-bold tracking-tight">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.originalPrice && product.originalPrice > product.price ? (
                <span className="text-lg text-muted-foreground line-through font-medium">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
              ) : null}
            </div>
            {product.discountPercent ? (
              <p className="text-sm font-semibold text-green-600">
                You save {formatPrice((product.originalPrice ?? product.price) - product.price, product.currency)}
              </p>
            ) : null}
          </div>

          {/* CTAs */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={handleBuyClick}
              className="flex-1 h-12 bg-primary text-primary-foreground text-sm font-bold rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Buy Now <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`h-12 w-12 rounded-full flex items-center justify-center border-2 transition-all ${
                saved ? "border-red-400 bg-red-50 text-red-500" : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              <Heart className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="text-sm font-bold mb-2.5 text-muted-foreground uppercase tracking-wider">About</h3>
              <div className="text-sm leading-relaxed text-foreground/80 space-y-1.5">
                {product.description.split("\n").map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          )}

          {/* Specs */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="bg-card rounded-2xl overflow-hidden shadow-xs">
              <div className="px-5 py-3 border-b border-border/60">
                <h3 className="text-sm font-bold">Specifications</h3>
              </div>
              <div className="divide-y divide-border/60">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between px-5 py-3 gap-6">
                    <span className="text-xs text-muted-foreground font-medium capitalize flex-shrink-0">
                      {k.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-xs font-semibold text-right">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Recommendations ── */}
      <RecommendationSection currentId={product.id} category={product.category} />
    </motion.div>
  );
}
