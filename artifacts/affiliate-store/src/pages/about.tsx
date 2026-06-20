import { motion } from "framer-motion";
import { Link } from "wouter";
import { Sparkles, ShieldCheck, Zap, Heart, ArrowRight } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const values = [
  {
    icon: Sparkles,
    color: "#3b6fd4",
    bg: "hsl(221,55%,93%)",
    title: "Curated with intent",
    desc: "Every product on Curation is hand-reviewed. We don't list everything — we list what's worth your attention.",
  },
  {
    icon: ShieldCheck,
    color: "#2e7d5e",
    bg: "hsl(155,45%,92%)",
    title: "Transparency first",
    desc: "We clearly disclose every affiliate relationship. If we earn a commission, you'll know — always.",
  },
  {
    icon: Zap,
    color: "#b45309",
    bg: "hsl(38,80%,93%)",
    title: "Constantly updated",
    desc: "Prices and availability shift daily. We monitor product listings to keep information as accurate as possible.",
  },
  {
    icon: Heart,
    color: "#b91c1c",
    bg: "hsl(0,70%,94%)",
    title: "Built for real shoppers",
    desc: "No dark patterns, no fake reviews. Honest picks based on actual quality and value — for India's diverse market.",
  },
];

export default function AboutPage() {
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
          About Us
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug mb-4">
          We find the best products.<br />You buy with confidence.
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
          Curation is an affiliate product discovery platform built specifically for India. We scour the web daily — from Amazon and Flipkart to niche boutiques — and surface products that actually deserve your rupees.
        </p>
      </motion.div>

      {/* Mission card */}
      <motion.div
        variants={fade}
        className="bg-card rounded-2xl p-7 mb-6 shadow-xs border border-border/60"
      >
        <h2 className="text-lg font-bold mb-3">Our mission</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Online shopping in India is overwhelming. Thousands of listings, confusing specs, dubious reviews, and prices that change hourly. We started Curation to cut through that noise — building a trusted destination where every product card represents a genuine recommendation, not a paid placement.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-3">
          We're an affiliate platform, which means we earn a small commission when you buy through our links. That commission funds the curation work — and it never costs you a single extra rupee.
        </p>
      </motion.div>

      {/* Values grid */}
      <motion.div variants={fade} className="mb-8">
        <h2 className="text-lg font-bold mb-5">What we stand for</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {values.map(({ icon: Icon, color, bg, title, desc }) => (
            <div key={title} className="bg-card rounded-2xl p-5 shadow-xs border border-border/60 flex gap-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <h3 className="text-sm font-bold mb-1">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
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
          <h3 className="text-white font-bold text-base mb-1">Start exploring</h3>
          <p className="text-sm" style={{ color: "hsl(221,40%,78%)" }}>Browse our hand-curated selection across 8 categories.</p>
        </div>
        <Link href="/products">
          <span className="inline-flex items-center gap-2 bg-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-white/90 transition-colors shrink-0" style={{ color: "hsl(221,65%,38%)" }}>
            Browse products <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}
