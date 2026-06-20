import { motion } from "framer-motion";
import { useWishlist } from "@/hooks/use-wishlist";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Heart } from "lucide-react";
import { Link } from "wouter";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

function WishlistProduct({ id }: { id: number }) {
  const { data: product, isLoading } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) },
  });
  if (isLoading) return <div className="aspect-[3/4] bg-card animate-pulse rounded-2xl" />;
  if (!product) return null;
  return <ProductCard product={product} />;
}

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="p-5 md:p-7">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
          <Heart className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Your Wishlist</h1>
          <p className="text-xs text-muted-foreground">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved · stored locally on your device
          </p>
        </div>
      </div>

      {wishlist.length === 0 ? (
        <div className="py-24 text-center bg-card rounded-2xl">
          <Heart className="w-10 h-10 mx-auto text-muted-foreground mb-4 opacity-20" />
          <p className="font-semibold mb-1">Nothing saved yet</p>
          <p className="text-sm text-muted-foreground mb-5">Click the heart on any product to save it here.</p>
          <Link href="/products">
            <span className="inline-block text-sm font-bold text-primary hover:underline">Browse products</span>
          </Link>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {wishlist.map((id) => <WishlistProduct key={id} id={id} />)}
        </motion.div>
      )}
    </div>
  );
}
