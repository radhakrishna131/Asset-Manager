import { motion } from "framer-motion";
import { Link } from "wouter";
import { Search, MousePointer2, ShoppingCart, BadgeCheck, Tag, Star, RefreshCw, ArrowRight } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Browse or search",
    desc: "Use the sidebar to explore by category — Electronics, Fashion, Books, and more — or type directly in the search bar to find something specific. You can also filter by deals, top rated, or trending picks.",
  },
  {
    step: "02",
    icon: BadgeCheck,
    title: "We've already vetted it",
    desc: "Each product card shows key information we've extracted: the brand, price in INR, rating, and discount. Products are reviewed before being added — so you're not wading through junk listings.",
  },
  {
    step: "03",
    icon: MousePointer2,
    title: "Click 'Buy Now'",
    desc: "When you find something you want, click the blue price button or the 'Buy Now' button on the product page. You'll be taken directly to the retailer's website — Amazon, Flipkart, or another trusted store.",
  },
  {
    step: "04",
    icon: ShoppingCart,
    title: "Complete your purchase on the retailer's site",
    desc: "The actual transaction happens entirely on the retailer's platform. They handle payment, delivery, returns, and customer support. Curation is never involved in the purchase itself.",
  },
];

const faqs = [
  {
    q: "Do I pay more when buying through Curation?",
    a: "No — never. The price you see on the retailer's site is identical whether you arrive from Curation or type the URL directly. Affiliate commissions are paid by the retailer, not added to your bill.",
  },
  {
    q: "How are products selected?",
    a: "Our team manually reviews each product before adding it to the platform. We look at ratings, review quality, price-to-value ratio, and brand reputation. Products with suspiciously inflated reviews or misleading specs are excluded.",
  },
  {
    q: "Are prices always accurate?",
    a: "We do our best to keep prices up to date, but online retail prices can change multiple times a day. Always confirm the final price on the retailer's checkout page before completing your purchase.",
  },
  {
    q: "What is the Wishlist?",
    a: "The Wishlist lets you save products you're interested in without leaving the site. It's stored locally on your device — no account required — so you can come back and compare later.",
  },
  {
    q: "Can I return a product I bought through Curation?",
    a: "Returns and refunds are handled entirely by the retailer where you purchased. Curation has no involvement in the transaction. Refer to the retailer's own return policy.",
  },
];

export default function HowItWorksPage() {
  return (
    <motion.div
      className="p-5 md:p-8 max-w-3xl"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
      <motion.div variants={fade} className="mb-10">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-accent px-3 py-1.5 rounded-full mb-4">
          How It Works
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug mb-4">
          Simple, transparent,<br />and free to use.
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
          Curation connects you to the best products across India's top retailers. Here's exactly how the process works — from browsing to buying.
        </p>
      </motion.div>

      {/* Steps */}
      <motion.div variants={fade} className="mb-10">
        <div className="space-y-4">
          {steps.map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="bg-card rounded-2xl p-6 shadow-xs border border-border/60 flex gap-5">
              <div className="shrink-0 flex flex-col items-center gap-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "hsl(221,55%,93%)" }}
                >
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground/50">{step}</span>
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-sm mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* How affiliate links work */}
      <motion.div variants={fade} className="bg-card rounded-2xl p-7 mb-8 shadow-xs border border-border/60">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "hsl(38,80%,93%)" }}>
            <Tag className="w-4 h-4 text-amber-600" />
          </div>
          <h2 className="text-base font-bold">How affiliate links work</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          When you click a product link on Curation, a small tracking parameter is added to the URL. If you complete a purchase within a set window (usually 24 hours), the retailer pays Curation a commission — typically 1–8% of the sale price.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This commission is how we fund the platform. It comes from the retailer's marketing budget, not your wallet. The price you pay is identical to what you'd pay visiting the store directly.
        </p>
      </motion.div>

      {/* FAQ */}
      <motion.div variants={fade} className="mb-8">
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
          <Star className="w-4 h-4 text-primary" /> Frequently asked questions
        </h2>
        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <div key={q} className="bg-card rounded-2xl p-5 shadow-xs border border-border/60">
              <h3 className="text-sm font-bold mb-2">{q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        variants={fade}
        className="rounded-2xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        style={{ background: "linear-gradient(135deg, hsl(221,65%,38%) 0%, hsl(221,65%,28%) 100%)" }}
      >
        <div>
          <h3 className="text-white font-bold text-base mb-1">Ready to explore?</h3>
          <p className="text-sm" style={{ color: "hsl(221,40%,78%)" }}>Check out today's curated deals — updated daily.</p>
        </div>
        <Link href="/deals">
          <span className="inline-flex items-center gap-2 bg-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors shrink-0" style={{ color: "hsl(221,65%,38%)" }}>
            Today's deals <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}
