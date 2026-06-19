import { motion } from "framer-motion";
import { useWishlist } from "@/hooks/use-wishlist";
import { useGetProduct, getGetProductQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Heart } from "lucide-react";
import { Link } from "wouter";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

function WishlistProduct({ id }: { id: number }) {
  const { data: product, isLoading } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) },
  });

  if (isLoading) return <div className="aspect-[4/3] bg-muted animate-pulse" />;
  if (!product) return null;
  return <ProductCard product={product} />;
}

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="border-b border-border/60 pb-10 mb-12">
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-medium mb-4">Saved items</p>
        <h1 className="text-3xl font-semibold tracking-tight mb-3">Your wishlist</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Products you've saved for later. Stored locally on your device.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="py-24 text-center">
          <Heart className="w-8 h-8 mx-auto text-muted-foreground mb-5 opacity-30" />
          <p className="text-sm text-muted-foreground mb-4">Your wishlist is empty.</p>
          <Link href="/products">
            <span className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
              Browse products
            </span>
          </Link>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {wishlist.map((id) => <WishlistProduct key={id} id={id} />)}
        </motion.div>
      )}
    </div>
  );
}
