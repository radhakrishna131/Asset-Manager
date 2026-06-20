import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, ArrowUpRight, ChevronLeft, ChevronRight, Tag, Zap, TrendingUp } from "lucide-react";
import {
  useGetFeaturedProducts, getGetFeaturedProductsQueryKey,
  useGetTrendingProducts, getGetTrendingProductsQueryKey,
  useGetDealsProducts, getGetDealsProductsQueryKey,
  useListCategories, getListCategoriesQueryKey,
} from "@workspace/api-client-react";
import { ProductCard, cardVariants } from "@/components/ProductCard";
import { formatPrice } from "@/lib/format";

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

type FilterTab = "all" | "featured" | "deals" | "trending";

export default function Home() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const { data: featured } = useGetFeaturedProducts({ limit: 6 }, {
    query: { queryKey: getGetFeaturedProductsQueryKey({ limit: 6 }) },
  });
  const { data: trending } = useGetTrendingProducts({ limit: 6 }, {
    query: { queryKey: getGetTrendingProductsQueryKey({ limit: 6 }) },
  });
  const { data: deals } = useGetDealsProducts({ limit: 6 }, {
    query: { queryKey: getGetDealsProductsQueryKey({ limit: 6 }) },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) setLocation(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  const tabProducts =
    activeTab === "featured" ? featured :
    activeTab === "deals" ? deals :
    activeTab === "trending" ? trending :
    featured;

  const topDeal = deals?.[0];
  const topFeatured = featured?.[0];

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "featured", label: "Featured" },
    { key: "deals", label: "Deals" },
    { key: "trending", label: "Trending" },
  ];

  return (
    <div className="p-5 md:p-7 max-w-[1100px]">

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="hidden sm:flex items-center gap-1 bg-card rounded-xl p-1 shadow-xs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="search"
                placeholder="Search..."
                className="h-9 w-40 md:w-56 pl-9 pr-3 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>
        </div>
      </div>

      {/* Main grid: editorial banners + product cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-5 mb-5">

        {/* Left: editorial banner cards */}
        <div className="flex flex-col gap-5">

          {/* Banner 1 — Teal/mint: top deal */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl overflow-hidden min-h-[200px] flex items-end"
            style={{ background: "linear-gradient(135deg, #B2F5EA 0%, #81E6D9 50%, #4FD1C5 100%)" }}
          >
            {/* Background product image */}
            {topDeal?.images?.[0] && (
              <div className="absolute right-0 top-0 h-full w-1/2 pointer-events-none">
                <img
                  src={topDeal.images[0]}
                  alt=""
                  className="h-full w-full object-cover object-center opacity-80"
                  style={{ maskImage: "linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)" }}
                />
              </div>
            )}
            <div className="relative z-10 p-7 flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-teal-800/70 mb-1">Limited Time</p>
                <h2 className="text-3xl font-bold text-teal-900 leading-tight">
                  Get up to{" "}
                  {topDeal?.discountPercent ? `${topDeal.discountPercent}%` : "50%"} off
                </h2>
                <p className="text-sm text-teal-800/70 mt-1 max-w-xs">
                  {topDeal?.title || "Best deals of the season, curated daily"}
                </p>
              </div>
              <Link href="/deals">
                <span className="inline-flex items-center gap-2 bg-white text-teal-900 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors shadow-sm w-fit">
                  Get Discount <Tag className="w-3.5 h-3.5" />
                </span>
              </Link>
            </div>
          </motion.div>

          {/* Banner 2 — Yellow: editorial */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl overflow-hidden min-h-[170px] flex items-end"
            style={{ background: "linear-gradient(135deg, #FEFCBF 0%, #FAF089 50%, #F6E05E 100%)" }}
          >
            {topFeatured?.images?.[0] && (
              <div className="absolute right-0 top-0 h-full w-2/5 pointer-events-none">
                <img
                  src={topFeatured.images[0]}
                  alt=""
                  className="h-full w-full object-cover object-center opacity-70"
                  style={{ maskImage: "linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)" }}
                />
              </div>
            )}
            <div className="relative z-10 p-7 flex items-start justify-between w-full">
              <div>
                <h2 className="text-2xl font-bold text-yellow-900 leading-snug">Best Sellers</h2>
                <p className="text-sm text-yellow-800/70 mt-1">Handpicked for quality & value</p>
              </div>
              <Link href="/products">
                <div className="w-9 h-9 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-xs">
                  <ArrowUpRight className="w-4 h-4 text-yellow-900" />
                </div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right: product cards */}
        <div className="flex flex-col gap-4">
          <motion.div
            className="grid grid-cols-2 gap-4"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {(tabProducts ?? featured)?.slice(0, 2).map((p) => (
              <ProductCard key={p.id} product={p} size="sm" />
            ))}
          </motion.div>

          {/* Collection editorial card */}
          {(tabProducts ?? featured)?.[2] && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="relative bg-card rounded-2xl overflow-hidden shadow-xs flex items-end min-h-[140px]"
            >
              {(tabProducts ?? featured)?.[2]?.images?.[0] && (
                <div className="absolute inset-0">
                  <img
                    src={(tabProducts ?? featured)![2].images![0]}
                    alt=""
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              )}
              <div className="relative z-10 p-4 w-full flex items-end justify-between">
                <div>
                  <p className="text-xs text-white/70 mb-1 font-medium">Curated Collection</p>
                  <h3 className="text-base font-bold text-white leading-snug">
                    {(tabProducts ?? featured)?.[2]?.title?.split(" ").slice(0, 4).join(" ")}
                  </h3>
                </div>
                <Link href={`/products/${(tabProducts ?? featured)?.[2]?.id}`}>
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5 text-white" />
                  </div>
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Deals row */}
      {deals && deals.length > 0 && (
        <section className="mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center">
                <Tag className="w-3.5 h-3.5 text-red-500" />
              </div>
              <span className="text-base font-bold">Today's Deals</span>
            </div>
            <Link href="/deals">
              <span className="text-xs font-semibold text-primary hover:underline">See all</span>
            </Link>
          </div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {deals.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </motion.div>
        </section>
      )}

      {/* Trending row */}
      {trending && trending.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <span className="text-base font-bold">Trending Now</span>
            </div>
            <Link href="/products?sort=popular">
              <span className="text-xs font-semibold text-primary hover:underline">Explore all</span>
            </Link>
          </div>

          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {trending.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </motion.div>
        </section>
      )}
    </div>
  );
}
