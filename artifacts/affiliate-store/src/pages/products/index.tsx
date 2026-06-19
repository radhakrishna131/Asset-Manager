import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useListProducts, getListProductsQueryKey, useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, Loader2, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function ProductsPage() {
  const [location] = useLocation();
  const params = new URLSearchParams(window.location.search);
  
  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "all");
  const [sort, setSort] = useState(params.get("sort") || "relevance");
  const [page, setPage] = useState(parseInt(params.get("page") || "1"));
  
  const limit = 12;

  // Re-sync state when URL changes (for back button support)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setSearch(urlParams.get("search") || "");
    setCategory(urlParams.get("category") || "all");
    setSort(urlParams.get("sort") || "relevance");
    setPage(parseInt(urlParams.get("page") || "1"));
  }, [location]);

  // Push state to URL
  const updateUrl = (updates: Record<string, string>) => {
    const newParams = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "1" && value !== "relevance") {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Use history API directly so we don't trigger unnecessary re-renders if wouter misbehaves
    window.history.pushState({}, "", `/products${newParams.toString() ? `?${newParams.toString()}` : ""}`);
    
    // Manual state updates to trigger queries
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
      <div className="space-y-2">
        <h3 className="font-semibold text-sm tracking-tight text-muted-foreground uppercase">Categories</h3>
        <div className="flex flex-col space-y-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`justify-start ${category === "all" ? "bg-primary/10 text-primary font-bold" : "font-normal"}`}
            onClick={() => updateUrl({ category: "all", page: "1" })}
          >
            All Categories
          </Button>
          {categories?.map((cat) => (
            <Button
              key={cat.id}
              variant="ghost"
              size="sm"
              className={`justify-start ${category === cat.slug ? "bg-primary/10 text-primary font-bold" : "font-normal"}`}
              onClick={() => updateUrl({ category: cat.slug, page: "1" })}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0 border-r pr-8">
          <div className="sticky top-24">
            <h2 className="text-xl font-bold mb-6">Filters</h2>
            <FiltersContent />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Products</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                {data?.total || 0} results found
              </p>
            </div>

            <div className="flex w-full sm:w-auto items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search..." 
                  className="pl-9 bg-muted/50 border-none"
                  value={search}
                  onChange={(e) => updateUrl({ search: e.target.value, page: "1" })}
                />
                {search && (
                  <button 
                    onClick={() => updateUrl({ search: "", page: "1" })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <Select value={sort} onValueChange={(val) => updateUrl({ sort: val, page: "1" })}>
                <SelectTrigger className="w-[160px] bg-muted/50 border-none">
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

              {/* Mobile Filter Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden shrink-0">
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

          {/* Product Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p>Loading products...</p>
            </div>
          ) : data?.products.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We couldn't find any products matching your current filters. Try adjusting your search or category.
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
                Clear all filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button 
                    variant="outline" 
                    disabled={page === 1}
                    onClick={() => updateUrl({ page: String(page - 1) })}
                  >
                    Previous
                  </Button>
                  <div className="text-sm font-medium px-4">
                    Page {page} of {totalPages}
                  </div>
                  <Button 
                    variant="outline" 
                    disabled={page === totalPages}
                    onClick={() => updateUrl({ page: String(page + 1) })}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
