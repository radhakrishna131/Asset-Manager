import { useState } from "react";
import { useRoute } from "wouter";
import { useGetProduct, getGetProductQueryKey, useTrackProductClick } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Store, ExternalLink, Heart, Check, Info } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";

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
        <div className="grid md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
      </div>
    );
  }

  const saved = isInWishlist(product.id);
  const images = product.images?.length ? product.images : [];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        
        {/* Gallery */}
        <div className="space-y-4 sticky top-24">
          <div className="aspect-square rounded-3xl overflow-hidden bg-muted/30 border">
            {images.length > 0 ? (
              <img 
                src={images[activeImage]} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 px-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === i ? "border-primary ring-2 ring-primary/20 ring-offset-2" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i+1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="px-3 py-1 font-medium bg-muted/50">
              {product.category}
            </Badge>
            {product.discountPercent && (
              <Badge variant="destructive" className="px-3 py-1 font-bold">
                {product.discountPercent}% OFF
              </Badge>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
            {product.title}
          </h1>

          <div className="flex items-center gap-6 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2 text-muted-foreground font-medium">
              <Store className="w-5 h-5" />
              <span>{product.store || product.brand || 'Unknown Store'}</span>
            </div>
            {product.rating && (
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 px-2 py-1 rounded-md font-bold">
                <Star className="w-4 h-4 fill-current" />
                <span>{product.rating.toFixed(1)}</span>
                {product.reviewCount && <span className="text-amber-700/60 dark:text-amber-400/60 text-sm font-medium ml-1">({product.reviewCount})</span>}
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-5xl font-bold tracking-tighter">
                {product.currency || '$'}{product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-muted-foreground line-through mb-1.5 font-medium">
                  {product.currency || '$'}{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.inStock !== false ? (
              <div className="flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                <Check className="w-4 h-4" /> In Stock
              </div>
            ) : (
              <div className="text-sm font-medium text-destructive">Out of Stock</div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button 
              size="lg" 
              className="flex-1 h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20"
              onClick={handleBuyClick}
            >
              Buy Now <ExternalLink className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant={saved ? "secondary" : "outline"} 
              className={`h-14 px-8 rounded-2xl border-2 ${saved ? "border-transparent" : "border-border"}`}
              onClick={() => toggleWishlist(product.id)}
            >
              <Heart className={`w-5 h-5 mr-2 ${saved ? "fill-current text-primary" : ""}`} />
              {saved ? "Saved" : "Save"}
            </Button>
          </div>

          {product.description && (
            <div className="mb-12">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> About this item
              </h3>
              <div className="prose prose-gray dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                {product.description.split('\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          )}

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="mb-12">
              <h3 className="text-lg font-bold mb-4">Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([k, v]) => (
                  <div key={k} className="bg-muted/30 p-4 rounded-xl border">
                    <div className="text-sm text-muted-foreground mb-1 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="font-semibold">{String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
