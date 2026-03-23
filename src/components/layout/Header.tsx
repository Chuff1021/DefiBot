"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const primaryNav = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/connect", label: "Connect" },
];

const secondaryNav = [
  { href: "/strategies", label: "Strategies" },
  { href: "/settings", label: "Settings" },
];

export function Header({ logoUrl: _logoUrl }: { logoUrl?: string }) {
  void _logoUrl;

  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="website-header">
      <div className="website-header-inner">
        <Link href="/" className="website-brand" onClick={() => setMenuOpen(false)}>
          <span className="website-brand-mark">
            <SparkMark />
          </span>
          <div>
            <p className="website-brand-name">Kalshi BotOS</p>
            <p className="website-brand-copy">GPT + live Kalshi market review</p>
          </div>
        </Link>

        <nav className="website-nav" aria-label="Primary navigation">
          {primaryNav.map((item) => {
            const active = pathname === item.href;

            return (
              <Link key={item.href} href={item.href} className={`website-nav-link ${active ? "website-nav-link-active" : ""}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="website-header-actions">
          <Link href="/connect" className="site-button site-button-secondary header-cta-secondary">
            Setup
          </Link>
          <Link href="/dashboard" className="site-button site-button-primary header-cta-primary">
            Live market app
          </Link>
        </div>

        <button
          type="button"
          className="website-menu-toggle"
          onClick={() => setMenuOpen((value) => !value)}
          aria-expanded={menuOpen}
          aria-controls="website-mobile-menu"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div id="website-mobile-menu" className="website-mobile-menu">
          {[...primaryNav, ...secondaryNav].map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`website-mobile-link ${active ? "website-mobile-link-active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

function SparkMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <path
        d="M12 2 14.7 8.3 21 11l-6.3 2.7L12 20l-2.7-6.3L3 11l6.3-2.7L12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}
