import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import {
  useGetFeaturedProducts, getGetFeaturedProductsQueryKey,
  useGetTrendingProducts, getGetTrendingProductsQueryKey,
  useGetDealsProducts, getGetDealsProductsQueryKey,
  useListCategories, getListCategoriesQueryKey,
} from "@workspace/api-client-react";
import { ProductCard, cardVariants } from "@/components/ProductCard";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function SectionHeader({
  label,
  title,
  href,
  linkLabel = "View all",
}: {
  label: string;
  title: string;
  href: string;
  linkLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-end justify-between mb-8"
    >
      <div>
        <p className="text-[10px] tracking-widest uppercase text-muted-foreground font-medium mb-2">{label}</p>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      <Link href={href}>
        <span className="group hidden md:flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
          {linkLabel}
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
        </span>
      </Link>
    </motion.div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const { data: featured } = useGetFeaturedProducts({ limit: 4 }, {
    query: { queryKey: getGetFeaturedProductsQueryKey({ limit: 4 }) },
  });
  const { data: trending } = useGetTrendingProducts({ limit: 4 }, {
    query: { queryKey: getGetTrendingProductsQueryKey({ limit: 4 }) },
  });
  const { data: deals } = useGetDealsProducts({ limit: 4 }, {
    query: { queryKey: getGetDealsProductsQueryKey({ limit: 4 }) },
  });
  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) setLocation(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6">

      {/* Hero */}
      <motion.section
        className="py-20 md:py-28 border-b border-border/60"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.p variants={fadeUp} className="text-[10px] tracking-widest uppercase text-muted-foreground font-medium mb-6">
          India's curated product marketplace
        </motion.p>
        <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.08] mb-8 max-w-2xl">
          Products worth<br />your attention.
        </motion.h1>
        <motion.p variants={fadeUp} className="text-base text-muted-foreground max-w-md mb-10 leading-relaxed">
          Independently curated. Transparently priced. Every product hand-selected for quality and value.
        </motion.p>

        <motion.form variants={fadeUp} onSubmit={handleSearch} className="flex items-center gap-3 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search products..."
              className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-foreground/20 focus:border-foreground/30 transition-all placeholder:text-muted-foreground/60"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="h-10 px-5 bg-foreground text-background text-xs font-semibold tracking-wide uppercase rounded-sm hover:bg-foreground/90 transition-colors"
          >
            Search
          </button>
        </motion.form>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <motion.div variants={fadeUp} className="flex flex-wrap gap-x-6 gap-y-3 mt-10">
            {categories.slice(0, 8).map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer uppercase tracking-wider font-medium">
                  {cat.name}
                </span>
              </Link>
            ))}
          </motion.div>
        )}
      </motion.section>

      {/* Featured */}
      {featured && featured.length > 0 && (
        <section className="py-16 border-b border-border/60">
          <SectionHeader label="Handpicked" title="Featured selections" href="/products?featured=true" />
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </motion.div>
        </section>
      )}

      {/* Deals */}
      {deals && deals.length > 0 && (
        <section className="py-16 border-b border-border/60">
          <SectionHeader label="Limited time" title="Best deals today" href="/deals" linkLabel="All deals" />
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {deals.map((p) => <ProductCard key={p.id} product={p} />)}
          </motion.div>
        </section>
      )}

      {/* Trending */}
      {trending && trending.length > 0 && (
        <section className="py-16">
          <SectionHeader label="Popular right now" title="Trending products" href="/products?sort=popular" linkLabel="Explore all" />
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {trending.map((p) => <ProductCard key={p.id} product={p} />)}
          </motion.div>
        </section>
      )}
    </div>
  );
}
