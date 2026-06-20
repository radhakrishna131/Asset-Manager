import { motion } from "framer-motion";
import { useGetDealsProducts, getGetDealsProductsQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Loader2, Tag } from "lucide-react";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

export default function DealsPage() {
  const { data: deals, isLoading } = useGetDealsProducts({ limit: 50 }, {
    query: { queryKey: getGetDealsProductsQueryKey({ limit: 50 }) },
  });

  return (
    <div className="p-5 md:p-7">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
          <Tag className="w-4.5 h-4.5 text-red-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Today's Deals</h1>
          <p className="text-xs text-muted-foreground">Updated daily with the biggest discounts</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : deals?.length === 0 ? (
        <div className="py-24 text-center bg-card rounded-2xl">
          <Tag className="w-8 h-8 mx-auto text-muted-foreground mb-3 opacity-30" />
          <p className="text-muted-foreground">No active deals right now. Check back soon.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {deals?.map((p) => <ProductCard key={p.id} product={p} />)}
        </motion.div>
      )}
    </div>
  );
}
