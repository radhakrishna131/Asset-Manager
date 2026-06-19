import { motion } from "framer-motion";
import { useGetDealsProducts, getGetDealsProductsQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Loader2 } from "lucide-react";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export default function DealsPage() {
  const { data: deals, isLoading } = useGetDealsProducts({ limit: 50 }, {
    query: { queryKey: getGetDealsProductsQueryKey({ limit: 50 }) },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="border-b border-border/60 pb-10 mb-12">
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-medium mb-4">Updated daily</p>
        <h1 className="text-3xl font-semibold tracking-tight mb-3">Best deals today</h1>
        <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
          The biggest discounts across all categories. Prices change quickly — don't miss out.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : deals?.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm text-muted-foreground">No active deals at the moment. Check back soon.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {deals?.map((p) => <ProductCard key={p.id} product={p} />)}
        </motion.div>
      )}
    </div>
  );
}
