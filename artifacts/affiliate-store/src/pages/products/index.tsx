import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useListProducts, getListProductsQueryKey, useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { ProductCard, cardVariants } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Loader2, X, LayoutGrid } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
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
    const urlParams = new URLSearchParams(window.location.search);
    setSearch(urlParams.get("search") || "");
    setCategory(urlParams.get("category") || "all");
    setSort(urlParams.get("sort") || "relevance");
    setPage(parseInt(urlParams.get("page") || "1"));
  }, [location]);

  const updateUrl = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "1" && value !== "relevance") {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    window.history.pushState({}, "", `/products${newParams.toString() ? `?${newParams.toString()}` : ""}`);
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
    query: { queryKey: getListProductsQueryKey(queryParams) }
  });

  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const FiltersContent = () => (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h3 className="font-semibold text-xs tracking-widest text-muted-foreground uppercase px-2 mb-3">Categories</h3>
        <Button
          variant="ghost"
          size="sm"
          className={`w-full justify-start font-medium ${category === "all" ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : ""}`}
          onClick={() => updateUrl({ category: "all", page: "1" })}
        >
          All Categories
        </Button>
        {categories?.map((cat) => (
          <Button
            key={cat.id}
            variant="ghost"
            size="sm"
            className={`w-full justify-start font-medium ${category === cat.slug ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" : ""}`}
            onClick={() => updateUrl({ category: cat.slug, page: "1" })}
          >
            {cat.name}
            {cat.productCount > 0 && (
              <span className="ml-auto text-xs opacity-50">{cat.productCount}</span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-10"
    >
      <div className="flex flex-col md:flex-row gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24 p-4 rounded-2xl border bg-card">
            <h2 className="text-base font-bold mb-4 px-2">Filters</h2>
            <FiltersContent />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                {category !== "all" ? categories?.find(c => c.slug === category)?.name || "Products" : "All Products"}
              </h1>
              <motion.p
                key={data?.total}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground mt-1 text-sm"
              >
                {data?.total !== undefined ? `${data.total} result${data.total !== 1 ? "s" : ""}` : "Loading…"}
              </motion.p>
            </div>

            <div className="flex w-full sm:w-auto items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search products..."
                  className="pl-9 bg-muted/50 border-none rounded-xl"
                  value={search}
                  onChange={(e) => updateUrl({ search: e.target.value, page: "1" })}
                />
                <AnimatePresence>
                  {search && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      onClick={() => updateUrl({ search: "", page: "1" })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <Select value={sort} onValueChange={(val) => updateUrl({ sort: val, page: "1" })}>
                <SelectTrigger className="w-[155px] bg-muted/50 border-none rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="popular">Popularity</SelectItem>
                  <SelectItem value="highest_rated">Highest Rated</SelectItem>
                  <SelectItem value="lowest_price">Lowest Price</SelectItem>
                  <SelectItem value="highest_price">Highest Price</SelectItem>
                  <SelectItem value="biggest_discount">Biggest Discount</SelectItem>
                  <SelectItem value="latest">Newest Arrivals</SelectItem>
                </SelectContent>
              </Select>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden shrink-0 rounded-xl">
                    <Filter className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader className="mb-6">
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <FiltersContent />
                </SheetContent>
              </Sheet>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 text-muted-foreground"
              >
                <Loader2 className="w-8 h-8 animate-spin mb-4 opacity-50" />
                <p className="text-sm">Loading products…</p>
              </motion.div>
            ) : data?.products.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center py-24 bg-muted/20 rounded-2xl border border-dashed"
              >
                <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-30" />
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Try a different search term or category.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setSearch("");
                    setCategory("all");
                    updateUrl({ search: "", category: "all", page: "1" });
                  }}
                >
                  Clear filters
                </Button>
              </motion.div>
            ) : (
              <motion.div key="grid">
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {data?.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>

                {totalPages > 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-3 mt-12"
                  >
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => updateUrl({ page: String(page - 1) })}
                      className="rounded-xl"
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-medium text-muted-foreground px-2">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page === totalPages}
                      onClick={() => updateUrl({ page: String(page + 1) })}
                      className="rounded-xl"
                    >
                      Next
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
