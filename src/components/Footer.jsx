// Use plain <a> to avoid Next/link export edge cases in this environment.
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcPaypal } from "react-icons/fa";
import { SiKlarna, SiAfterpay } from "react-icons/si";

const footerLinks = [
  {
    title: "Shop",
    items: [
      { label: "New Arrivals", to: "/shop" },
      { label: "Bespoke Orders", to: "/contact" },
      { label: "Blog", to: "/blog" },
    ],
  },
  {
    title: "Client Services",
    items: [
      { label: "Contact", to: "/contact" },
      { label: "FAQs", to: "/faqs" },
      { label: "Returns Policy", to: "/returns" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms & Conditions", to: "/terms" },
    ],
  },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-burgundy text-gold border-t border-gold/15 mt-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="text-sm uppercase tracking-[0.6em] mb-4">ALLURAHOUSE</p>
            <p className="text-gold/80 leading-relaxed text-sm">
              Curating heritage craftsmanship with progressive beauty. Every strand is
              sourced, finished, and delivered with couture precision.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <p className="text-sm uppercase tracking-[0.4em] mb-4">
                {section.title}
              </p>
              <ul className="space-y-2 text-gold/80 text-sm">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <a href={item.to} className="hover:text-white transition">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-gold/15 pt-6 text-sm text-gold/70">
          <div className="flex flex-wrap items-center gap-3 text-2xl text-gold/70">
            <span className="text-xs uppercase tracking-[0.5em] text-gold/50">Payments</span>
            <FaCcVisa />
            <FaCcMastercard />
            <FaCcAmex />
            <FaCcPaypal />
            <SiKlarna className="text-xl" />
            <SiAfterpay className="text-xl" />
          </div>
          <p className="text-center md:text-left">&copy; {year} Allurahouse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
