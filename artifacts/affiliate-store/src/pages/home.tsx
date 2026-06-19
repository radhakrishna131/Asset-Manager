import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Sparkles, TrendingUp, Tag, ArrowRight } from "lucide-react";
import { 
  useGetFeaturedProducts, getGetFeaturedProductsQueryKey,
  useGetTrendingProducts, getGetTrendingProductsQueryKey,
  useGetDealsProducts, getGetDealsProductsQueryKey,
  useListCategories, getListCategoriesQueryKey
} from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const { data: featured } = useGetFeaturedProducts({ limit: 4 }, {
    query: { queryKey: getGetFeaturedProductsQueryKey({ limit: 4 }) }
  });

  const { data: trending } = useGetTrendingProducts({ limit: 4 }, {
    query: { queryKey: getGetTrendingProductsQueryKey({ limit: 4 }) }
  });

  const { data: deals } = useGetDealsProducts({ limit: 4 }, {
    query: { queryKey: getGetDealsProductsQueryKey({ limit: 4 }) }
  });

  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setLocation(`/products?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary text-primary-foreground py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1]">
              Discover Products Worth Owning
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 font-light max-w-2xl mx-auto">
              Curated selections of the highest quality items. Independently discovered, beautifully presented.
            </p>
            
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mt-10 flex items-center">
              <Search className="absolute left-4 w-6 h-6 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Search for anything..." 
                className="w-full h-14 pl-14 pr-32 text-lg rounded-full bg-background text-foreground border-none shadow-2xl focus-visible:ring-4 focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" size="lg" className="absolute right-1.5 h-11 rounded-full px-6 font-bold">
                Search
              </Button>
            </form>

            <div className="pt-8 flex flex-wrap justify-center gap-3">
              {categories?.slice(0, 6).map((cat) => (
                <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                  <span className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-sm font-medium transition-colors cursor-pointer block">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      {featured && featured.length > 0 && (
        <section className="py-20 container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold mb-2">
                <Sparkles className="w-5 h-5" />
                <span>Handpicked</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Featured Selections</h2>
            </div>
            <Link href="/products?featured=true">
              <Button variant="ghost" className="hidden md:flex group">
                View All <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Deals Section */}
      {deals && deals.length > 0 && (
        <section className="py-20 bg-muted/30 border-y">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 text-destructive font-bold mb-2">
                  <Tag className="w-5 h-5" />
                  <span>Limited Time</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Today's Best Deals</h2>
              </div>
              <Link href="/deals">
                <Button variant="ghost" className="hidden md:flex group">
                  See All Deals <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {deals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Section */}
      {trending && trending.length > 0 && (
        <section className="py-20 container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 text-amber-500 font-bold mb-2">
                <TrendingUp className="w-5 h-5" />
                <span>Popular Right Now</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Trending Products</h2>
            </div>
            <Link href="/products?sort=popular">
              <Button variant="ghost" className="hidden md:flex group">
                Explore Popular <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trending.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
