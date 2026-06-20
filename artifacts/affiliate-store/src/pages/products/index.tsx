import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useListProducts, getListProductsQueryKey, useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { ProductCard, cardVariants } from "@/components/ProductCard";
import { Search, Loader2, X, SlidersHorizontal, LayoutGrid } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const sortOptions = [
  { value: "relevance", label: "Relevance" },
  { value: "popular", label: "Most popular" },
  { value: "highest_rated", label: "Highest rated" },
  { value: "lowest_price", label: "Price: Low to high" },
  { value: "highest_price", label: "Price: High to low" },
  { value: "biggest_discount", label: "Biggest discount" },
  { value: "latest", label: "Newest first" },
];

export default function ProductsPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

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

  const allCats = [{ name: "All", slug: "all", id: 0, productCount: 0, description: null }].concat(
    (categories ?? []) as any
  );

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Sort by</p>
        <div className="space-y-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateUrl({ sort: opt.value, page: "1" })}
              className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-colors ${
                sort === opt.value
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-5 md:p-7">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-bold">All Products</h1>
          <span className="text-sm text-muted-foreground ml-1">
            {data?.total !== undefined ? `(${data.total})` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              placeholder="Search..."
              className="h-9 w-40 md:w-52 pl-9 pr-8 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/60"
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

          {/* Sort + Filter sheet on mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="h-9 px-3 bg-card border border-border rounded-xl text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sort & Filter</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-background">
              <SheetHeader className="mb-6">
                <SheetTitle>Sort & Filter</SheetTitle>
              </SheetHeader>
              <FilterPanel />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 mb-6 no-scrollbar">
        {allCats.map((cat: any) => (
          <button
            key={cat.slug}
            onClick={() => updateUrl({ category: cat.slug, page: "1" })}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
              category === cat.slug || (cat.slug === "all" && category === "all")
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-muted-foreground hover:text-foreground shadow-xs"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </motion.div>
        ) : data?.products.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="py-24 text-center bg-card rounded-2xl">
            <p className="text-muted-foreground mb-4">No products match your filters.</p>
            <button
              onClick={() => updateUrl({ search: "", category: "all", page: "1" })}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <motion.div key="grid">
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              {data?.products.map((p) => <ProductCard key={p.id} product={p} />)}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => updateUrl({ page: String(page - 1) })}
                  className="h-9 px-5 bg-card border border-border rounded-full text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                <button
                  disabled={page === totalPages}
                  onClick={() => updateUrl({ page: String(page + 1) })}
                  className="h-9 px-5 bg-card border border-border rounded-full text-sm font-medium disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
