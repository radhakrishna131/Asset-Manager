import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Sparkles, TrendingUp, Tag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { 
  useGetFeaturedProducts, getGetFeaturedProductsQueryKey,
  useGetTrendingProducts, getGetTrendingProductsQueryKey,
  useGetDealsProducts, getGetDealsProductsQueryKey,
  useListCategories, getListCategoriesQueryKey
} from "@workspace/api-client-react";
import { ProductCard, cardVariants } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

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
      <section className="relative bg-primary text-primary-foreground py-24 md:py-36 overflow-hidden">
        {/* Subtle animated gradient blob */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        >
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[140%] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[120%] rounded-full bg-white/5 blur-3xl" />
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-8 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                Curated picks. Honest prices.
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.05] mb-6"
            >
              Discover Products<br />
              <span className="opacity-80">Worth Owning</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-primary-foreground/70 font-light max-w-xl mx-auto mb-10"
            >
              Independently discovered, beautifully presented — the best products at the best prices in India.
            </motion.p>

            <motion.form
              variants={fadeUp}
              onSubmit={handleSearch}
              className="relative max-w-xl mx-auto flex items-center"
            >
              <Search className="absolute left-5 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search for anything..."
                className="w-full h-14 pl-14 pr-32 text-base rounded-full bg-background text-foreground border-none shadow-2xl focus-visible:ring-4 focus-visible:ring-primary/20"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" size="lg" className="absolute right-1.5 h-11 rounded-full px-6 font-bold">
                Search
              </Button>
            </motion.form>

            <motion.div variants={fadeIn} className="pt-10 flex flex-wrap justify-center gap-2.5">
              {categories?.slice(0, 7).map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.06, duration: 0.3, ease: "easeOut" }}
                >
                  <Link href={`/products?category=${cat.slug}`}>
                    <span className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-sm font-medium transition-all duration-200 cursor-pointer block hover:scale-105">
                      {cat.name}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      {featured && featured.length > 0 && (
        <section className="py-20 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <div className="flex items-center gap-2 text-primary font-bold mb-2 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Handpicked</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Featured Selections</h2>
            </div>
            <Link href="/products?featured=true">
              <Button variant="ghost" className="hidden md:flex group text-sm font-semibold">
                View All <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </section>
      )}

      {/* Deals Section */}
      {deals && deals.length > 0 && (
        <section className="py-20 bg-muted/30 border-y">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-end justify-between mb-10"
            >
              <div>
                <div className="flex items-center gap-2 text-destructive font-bold mb-2 text-sm">
                  <Tag className="w-4 h-4" />
                  <span>Limited Time</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Today's Best Deals</h2>
              </div>
              <Link href="/deals">
                <Button variant="ghost" className="hidden md:flex group text-sm font-semibold">
                  See All Deals <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              {deals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Trending Section */}
      {trending && trending.length > 0 && (
        <section className="py-20 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <div className="flex items-center gap-2 text-amber-500 font-bold mb-2 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Popular Right Now</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Trending Products</h2>
            </div>
            <Link href="/products?sort=popular">
              <Button variant="ghost" className="hidden md:flex group text-sm font-semibold">
                Explore Popular <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            {trending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        </section>
      )}

      {/* Stats Banner */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="py-16 bg-primary text-primary-foreground"
      >
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Products Listed", value: "1,200+" },
              { label: "Categories", value: "8+" },
              { label: "Happy Shoppers", value: "50K+" },
              { label: "Avg. Savings", value: "35%" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <div className="text-3xl md:text-4xl font-bold tracking-tighter mb-1">{stat.value}</div>
                <div className="text-primary-foreground/60 text-sm font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
