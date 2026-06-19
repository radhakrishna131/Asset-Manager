import { useWishlist } from "@/hooks/use-wishlist";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Heart, Loader2 } from "lucide-react";

function WishlistProduct({ id }: { id: number }) {
  const { data: product, isLoading } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) }
  });

  if (isLoading) {
    return (
      <div className="aspect-[3/4] bg-muted/20 animate-pulse rounded-xl border"></div>
    );
  }

  if (!product) return null;

  return <ProductCard product={product} />;
}

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 flex items-center gap-4">
          <Heart className="w-10 h-10 text-primary" />
          Your Wishlist
        </h1>
        <p className="text-xl text-muted-foreground">
          Products you've saved for later. Stored locally on your device.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-24 bg-muted/20 rounded-2xl border border-dashed">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-6 opacity-30" />
          <h3 className="text-2xl font-bold mb-3">Your wishlist is empty</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            When you see something you like, click the heart icon to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((id) => (
            <WishlistProduct key={id} id={id} />
          ))}
        </div>
      )}
    </div>
  );
}
