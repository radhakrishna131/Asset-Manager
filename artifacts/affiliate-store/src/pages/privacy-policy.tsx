import { motion } from "framer-motion";
import { Lock, Database, Cookie, Link2, Mail, Globe } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const sections = [
  {
    id: "information-we-collect",
    icon: Database,
    iconColor: "#3b6fd4",
    iconBg: "hsl(221,55%,93%)",
    title: "Information we collect",
    content: [
      {
        subtitle: "Information you provide",
        text: "Curation does not require account registration for browsing or using the Wishlist feature. The Wishlist is stored entirely in your browser's local storage — no data is sent to our servers.",
      },
      {
        subtitle: "Automatically collected information",
        text: "When you visit Curation, our servers may log standard web information: your IP address, browser type and version, pages visited, time and date of your visit, and referring URL. This data is used solely for security and operational purposes and is not sold or shared.",
      },
      {
        subtitle: "Analytics",
        text: "We may use privacy-respecting analytics tools to understand aggregate traffic patterns (e.g. which categories are most viewed). These tools do not track individual users across sites and do not collect personally identifiable information.",
      },
    ],
  },
  {
    id: "affiliate-tracking",
    icon: Link2,
    iconColor: "#2e7d5e",
    iconBg: "hsl(155,45%,92%)",
    title: "Affiliate link tracking",
    content: [
      {
        subtitle: "How tracking works",
        text: "When you click a product link on Curation, your browser may be redirected through a URL that contains tracking parameters. These parameters identify Curation as the referring affiliate so that the retailer can attribute any resulting commission to us.",
      },
      {
        subtitle: "Retailer cookies",
        text: "After you land on a retailer's website (e.g. Amazon India), that retailer may place their own cookies on your device to track the session for commission purposes. These cookies are governed by the retailer's own privacy policy, not ours.",
      },
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    iconColor: "#b45309",
    iconBg: "hsl(38,80%,93%)",
    title: "Cookies",
    content: [
      {
        subtitle: "What cookies we use",
        text: "Curation uses only essential session cookies necessary for the site to function (e.g. admin authentication). We do not use advertising cookies, third-party tracking cookies, or profiling cookies.",
      },
      {
        subtitle: "Browser local storage",
        text: "Your Wishlist data is stored in your browser's local storage — a mechanism that keeps data on your device only. It is never transmitted to Curation's servers and is cleared if you clear your browser data.",
      },
    ],
  },
  {
    id: "third-party-links",
    icon: Globe,
    iconColor: "#7c3aed",
    iconBg: "hsl(265,55%,94%)",
    title: "Third-party links",
    content: [
      {
        subtitle: "External sites",
        text: "Curation contains links to third-party websites (retailers, brands). Once you leave our site, this Privacy Policy no longer applies. We encourage you to review the privacy policies of any sites you visit.",
      },
      {
        subtitle: "Retailer policies",
        text: "Any personal data you provide to a retailer during the purchase process (name, address, payment details) is governed exclusively by that retailer's privacy policy and terms of service.",
      },
    ],
  },
  {
    id: "data-security",
    icon: Lock,
    iconColor: "#b91c1c",
    iconBg: "hsl(0,70%,94%)",
    title: "Data security",
    content: [
      {
        subtitle: "How we protect data",
        text: "Server logs are retained for a limited period and access is restricted to authorised personnel. We use HTTPS encryption for all connections to Curation. No sensitive personal or financial data is stored on our servers.",
      },
      {
        subtitle: "Breach notification",
        text: "In the unlikely event of a data breach affecting user information, we will notify affected parties as required by applicable law.",
      },
    ],
  },
  {
    id: "your-rights",
    icon: Mail,
    iconColor: "#0e7490",
    iconBg: "hsl(192,60%,92%)",
    title: "Your rights & contact",
    content: [
      {
        subtitle: "Your rights",
        text: "Since Curation collects minimal personal data, most users have little data to request. If you believe we hold any personal information about you, you may contact us to request access, correction, or deletion.",
      },
      {
        subtitle: "Contact us",
        text: "For any privacy-related queries, reach out through the Admin Portal. We aim to respond to all requests within 30 days.",
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </span>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-snug mb-4">
          Your privacy matters<br />to us.
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
          This policy explains what data Curation collects, how it is used, and your rights as a visitor. We've written it to be readable — not just legally compliant.
        </p>
        <p className="text-xs text-muted-foreground mt-3">Last updated: June 2026</p>
      </motion.div>

      {/* Table of contents */}
      <motion.div variants={fade} className="bg-card rounded-2xl p-6 shadow-xs border border-border/60 mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Contents</h2>
        <ol className="space-y-1.5">
          {sections.map(({ id, title }, i) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="text-sm text-primary hover:underline flex items-center gap-2 font-medium"
              >
                <span className="w-5 h-5 rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-primary shrink-0">
                  {i + 1}
                </span>
                {title}
              </a>
            </li>
          ))}
        </ol>
      </motion.div>

      {/* Sections */}
      <div className="space-y-5 mb-8">
        {sections.map(({ id, icon: Icon, iconColor, iconBg, title, content }) => (
          <motion.div
            key={id}
            id={id}
            variants={fade}
            className="bg-card rounded-2xl p-6 shadow-xs border border-border/60 scroll-mt-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                <Icon className="w-4 h-4" style={{ color: iconColor }} />
              </div>
              <h2 className="font-bold text-sm">{title}</h2>
            </div>
            <div className="space-y-4">
              {content.map(({ subtitle, text }) => (
                <div key={subtitle}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{subtitle}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer note */}
      <motion.div
        variants={fade}
        className="rounded-2xl p-5 border text-sm text-muted-foreground leading-relaxed"
        style={{ background: "hsl(220,14%,97%)", borderColor: "hsl(220,13%,90%)" }}
      >
        This Privacy Policy may be updated periodically. Material changes will be noted with a revised "Last updated" date at the top of this page. Continued use of Curation after changes constitutes acceptance of the updated policy.
      </motion.div>
    </motion.div>
  );
}
