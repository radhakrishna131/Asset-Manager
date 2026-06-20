import { motion } from "framer-motion";
import { AlertCircle, Link2, IndianRupee, ShieldCheck } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const sections = [
  {
    icon: Link2,
    iconColor: "#3b6fd4",
    iconBg: "hsl(221,55%,93%)",
    title: "We use affiliate links",
    body: [
      "Curation participates in various affiliate advertising programs, including those operated by Amazon India (Amazon Associates), Flipkart Affiliate Programme, and other e-commerce retailers. These programs are designed to provide a means for sites to earn advertising fees by advertising and linking to affiliate-merchant websites.",
      "When you click a product link on Curation and make a qualifying purchase, we may receive a commission from the retailer. This commission is paid by the retailer — not by you.",
    ],
  },
  {
    icon: IndianRupee,
    iconColor: "#2e7d5e",
    iconBg: "hsl(155,45%,92%)",
    title: "Your price is never affected",
    body: [
      "The price you pay for a product is exactly the same whether you arrive through Curation's affiliate link or navigate directly to the retailer's website. Affiliate commissions are funded from the retailer's marketing budget.",
      "We do not mark up prices, add hidden fees, or negotiate exclusive pricing. What you see on the product card is the price at the time of our last update — always confirm the final price at checkout on the retailer's site.",
    ],
  },
  {
    icon: ShieldCheck,
    iconColor: "#b45309",
    iconBg: "hsl(38,80%,93%)",
    title: "Editorial independence",
    body: [
      "Affiliate relationships do not influence which products we choose to feature. Curation's product selection is based on our own assessment of quality, value, and relevance for Indian consumers.",
      "We do not accept paid placements, sponsored listings, or fees from brands in exchange for featuring their products. If this policy ever changes, it will be clearly disclosed on the relevant product page.",
    ],
  },
];

export default function AffiliateDisclosurePage() {
  return (
    <motion.div
      className="p-5 md:p-8 max-w-3xl"
      variants={stagger}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
      <motion.div variants={fade} className="mb-8">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary bg-accent px-3 py-1.5 rounded-full mb-4">
          Affiliate Disclosure
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug mb-4">
          We believe in full<br />transparency.
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
          This disclosure explains how Curation earns revenue through affiliate marketing and how that may relate to the products we feature.
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          Last updated: June 2026
        </p>
      </motion.div>

      {/* Notice banner */}
      <motion.div
        variants={fade}
        className="flex gap-3 rounded-2xl p-5 mb-8 border"
        style={{ background: "hsl(221,55%,96%)", borderColor: "hsl(221,55%,85%)" }}
      >
        <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed" style={{ color: "hsl(221,50%,35%)" }}>
          <strong>In plain English:</strong> We earn a small commission when you buy something through our links. It costs you nothing extra, and it's how we keep the lights on. We only recommend products we'd actually stand behind.
        </p>
      </motion.div>

      {/* Main sections */}
      <motion.div variants={fade} className="space-y-5 mb-8">
        {sections.map(({ icon: Icon, iconColor, iconBg, title, body }) => (
          <div key={title} className="bg-card rounded-2xl p-6 shadow-xs border border-border/60">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                <Icon className="w-4 h-4" style={{ color: iconColor }} />
              </div>
              <h2 className="font-bold text-sm">{title}</h2>
            </div>
            <div className="space-y-3">
              {body.map((para, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
              ))}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Retailer list */}
      <motion.div variants={fade} className="bg-card rounded-2xl p-6 shadow-xs border border-border/60 mb-8">
        <h2 className="font-bold text-sm mb-4">Affiliate programmes we participate in</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            "Amazon Associates (Amazon India)",
            "Flipkart Affiliate Programme",
            "Myntra Partner Programme",
            "Nykaa Affiliate Programme",
            "Other retailer-specific affiliate programmes where applicable",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Contact */}
      <motion.div variants={fade} className="bg-card rounded-2xl p-6 shadow-xs border border-border/60">
        <h2 className="font-bold text-sm mb-2">Questions about this disclosure?</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If you have questions about our affiliate relationships or how we select products, reach out via the Admin Portal. We're happy to explain any aspect of our editorial or monetisation process.
        </p>
      </motion.div>
    </motion.div>
  );
}
