import { Link } from "wouter";
import { useListCategories, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { ExternalLink, Twitter, Instagram, Youtube, Rss } from "lucide-react";

const navSections = [
  {
    heading: "Explore",
    links: [
      { label: "New Arrivals", href: "/products" },
      { label: "Today's Deals", href: "/deals" },
      { label: "Trending", href: "/products?sort=popular" },
      { label: "Top Rated", href: "/products?sort=highest_rated" },
      { label: "My Wishlist", href: "/wishlist" },
    ],
  },
  {
    heading: "Info",
    links: [
      { label: "About Curation", href: "/about" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Admin Portal", href: "/admin" },
    ],
  },
];

const socials = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
  { icon: Rss, label: "Blog", href: "#" },
];

export function Footer() {
  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });

  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-8"
      style={{ background: "linear-gradient(160deg, hsl(221,45%,13%) 0%, hsl(221,40%,10%) 100%)" }}
    >
      {/* Top section */}
      <div className="px-7 pt-10 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="lg:col-span-1">
          <Link href="/">
            <span className="text-xl font-bold text-white tracking-tight">Curation</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "hsl(221,25%,65%)" }}>
            A carefully curated feed of the best products across the web — handpicked for quality, value, and relevance.
          </p>
          {/* Social links */}
          <div className="flex items-center gap-2 mt-5">
            {socials.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "hsl(221,35%,20%)", color: "hsl(221,25%,65%)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "hsl(221,65%,38%)";
                  (e.currentTarget as HTMLElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "hsl(221,35%,20%)";
                  (e.currentTarget as HTMLElement).style.color = "hsl(221,25%,65%)";
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>
        </div>

        {/* Nav sections */}
        {navSections.map((section) => (
          <div key={section.heading}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "hsl(221,25%,50%)" }}>
              {section.heading}
            </p>
            <ul className="space-y-2.5">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>
                    <span
                      className="text-sm transition-colors cursor-pointer hover:text-white"
                      style={{ color: "hsl(221,20%,68%)" }}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Categories */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: "hsl(221,25%,50%)" }}>
            Categories
          </p>
          <ul className="space-y-2.5">
            {categories?.map((cat) => (
              <li key={cat.id}>
                <Link href={`/products?category=${cat.slug}`}>
                  <span
                    className="text-sm transition-colors cursor-pointer hover:text-white flex items-center justify-between gap-2 group"
                    style={{ color: "hsl(221,20%,68%)" }}
                  >
                    {cat.name}
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                      style={{ background: "hsl(221,35%,20%)", color: "hsl(221,25%,55%)" }}
                    >
                      {cat.productCount}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid hsl(221,35%,18%)" }} />

      {/* Bottom bar */}
      <div className="px-7 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs" style={{ color: "hsl(221,20%,45%)" }}>
          © {year} Curation. All rights reserved. Product prices and availability may vary.
        </p>
        <p className="text-xs flex items-center gap-1.5" style={{ color: "hsl(221,20%,40%)" }}>
          <ExternalLink className="w-3 h-3" />
          Affiliate links on this site may earn us a commission at no extra cost to you.
        </p>
      </div>
    </footer>
  );
}
