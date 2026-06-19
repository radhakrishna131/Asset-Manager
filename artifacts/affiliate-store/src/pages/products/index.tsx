import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useListProducts, getListProductsQueryKey, useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { ProductCard, cardVariants } from "@/components/ProductCard";
import { Search, Loader2, X, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function ProductsPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);

  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [sort, setSort] = useState(params.get("sort") || "relevance");
  const [page, setPage] = useState(parseInt(params.get("page") || "1"));

  const limit = 12;

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setSearch(p.get("search") || "");
    setCategory(p.get("category") || "all");
    setSort(p.get("sort") || "relevance");
    setPage(parseInt(p.get("page") || "1"));
  }, [location]);

  const updateUrl = (updates: Record<string, string>) => {
    const p = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([k, v]) => {
      if (v && v !== "all" && v !== "1" && v !== "relevance") p.set(k, v);
      else p.delete(k);
    });
    window.history.pushState({}, "", `/products${p.toString() ? `?${p.toString()}` : ""}`);
    if (updates.search !== undefined) setSearch(updates.search);
    if (updates.category !== undefined) setCategory(updates.category);
    if (updates.sort !== undefined) setSort(updates.sort);
    if (updates.page !== undefined) setPage(parseInt(updates.page || "1"));
  };

  const queryParams = {
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    sort: sort as any,
    page,
    limit,
  };

  const { data, isLoading } = useListProducts(queryParams, {
    query: { queryKey: getListProductsQueryKey(queryParams) },
  });
  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const CatList = () => (
    <div className="space-y-px">
      {[{ name: "All Products", slug: "all" }, ...(categories || [])].map((cat) => {
        const active = cat.slug === category || (cat.slug === "all" && category === "all");
        return (
          <button
            key={cat.slug}
            onClick={() => updateUrl({ category: cat.slug, page: "1" })}
            className={`w-full text-left text-xs px-3 py-2 rounded-sm transition-colors uppercase tracking-wider font-medium ${
              active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );

  const sortOptions: { value: string; label: string }[] = [
    { value: "relevance", label: "Relevance" },
    { value: "popular", label: "Most popular" },
    { value: "highest_rated", label: "Highest rated" },
    { value: "lowest_price", label: "Price: Low to high" },
    { value: "highest_price", label: "Price: High to low" },
    { value: "biggest_discount", label: "Biggest discount" },
    { value: "latest", label: "Newest first" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row gap-12">

        {/* Sidebar */}
        <aside className="hidden md:block w-44 shrink-0">
          <div className="sticky top-20">
            <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-medium mb-4">Categories</p>
            <CatList />

            <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-medium mb-3 mt-8">Sort by</p>
            <div className="space-y-px">
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateUrl({ sort: opt.value, page: "1" })}
                  className={`w-full text-left text-xs px-3 py-2 rounded-sm transition-colors ${
                    sort === opt.value ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                placeholder="Search products..."
                className="w-full h-9 pl-9 pr-8 text-sm bg-white border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all placeholder:text-muted-foreground/60"
                value={search}
                onChange={(e) => updateUrl({ search: e.target.value, page: "1" })}
              />
              <AnimatePresence>
                {search && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => updateUrl({ search: "", page: "1" })}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden h-9 px-3 border border-border rounded-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span className="text-xs">Filter</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-xs tracking-widest uppercase">Filters</SheetTitle>
                </SheetHeader>
                <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-medium mb-3">Categories</p>
                <CatList />
              </SheetContent>
            </Sheet>

            <motion.span
              key={data?.total}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block"
            >
              {data?.total ?? "…"} results
            </motion.span>
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center justify-center py-24 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
              </motion.div>
            ) : data?.products.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="py-24 text-center">
                <p className="text-sm text-muted-foreground mb-4">No products match your filters.</p>
                <button
                  onClick={() => updateUrl({ search: "", category: "all", page: "1" })}
                  className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear filters
                </button>
              </motion.div>
            ) : (
              <motion.div key="grid">
                <motion.div
                  className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10"
                  variants={container}
                  initial="hidden"
                  animate="visible"
                >
                  {data?.products.map((p) => <ProductCard key={p.id} product={p} />)}
                </motion.div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-14">
                    <button
                      disabled={page === 1}
                      onClick={() => updateUrl({ page: String(page - 1) })}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors uppercase tracking-wider"
                    >
                      Previous
                    </button>
                    <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                    <button
                      disabled={page === totalPages}
                      onClick={() => updateUrl({ page: String(page + 1) })}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors uppercase tracking-wider"
                    >
                      Next
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
