import { useGetDealsProducts, getGetDealsProductsQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Loader2, Tag } from "lucide-react";

export default function DealsPage() {
  const { data: deals, isLoading } = useGetDealsProducts({ limit: 50 }, {
    query: { queryKey: getGetDealsProductsQueryKey({ limit: 50 }) }
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 text-destructive font-bold text-sm mb-6">
          <Tag className="w-4 h-4" />
          Updated Daily
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Today's Best Deals</h1>
        <p className="text-xl text-muted-foreground">
          The biggest discounts across all categories, curated to bring you genuine value. Prices change quickly.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Finding the best prices...</p>
        </div>
      ) : deals?.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
          <Tag className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No active deals</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Check back later! We update this page daily with new massive discounts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {deals?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
