"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ── Link definitions ─────────────────────────────────────────────────────────

const businessLinks = [
  { href: "/dashboard", label: "Business dashboard" },
  { href: "/review", label: "Submit review" },
];

const consumerLinks = [
  { href: "/profile", label: "Consumer profile" },
  { href: "/rewards", label: "Rewards" },
  { href: "/how-it-works", label: "How it works" },
];

// Flat ordered list for the mobile menu
const mobileLinks: Array<{ href: string; label: string }> = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Business dashboard" },
  { href: "/review", label: "Submit review" },
  { href: "/profile", label: "Consumer profile" },
  { href: "/rewards", label: "Rewards" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

const consumerHrefs = consumerLinks.map((l) => l.href);

// ── Component ─────────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false); // mobile drawer
  const [dropOpen, setDropOpen] = useState(false); // desktop consumer dropdown
  const dropRef = useRef<HTMLDivElement>(null);

  const isConsumerActive = consumerHrefs.includes(pathname);

  // Close desktop dropdown on outside click
  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  // Auto-close mobile menu whenever the route actually changes
  useEffect(() => {
    setMenuOpen(false);
    setDropOpen(false);
  }, [pathname]);

  const navLinkClass = (active: boolean) =>
    `border-b-2 px-1 py-1 text-sm font-medium transition-colors ${
      active ? "border-gold text-ink" : "border-transparent text-ink-muted hover:text-ink"
    }`;

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-hairline bg-plum">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" onClick={() => setMenuOpen(false)} className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center bg-gold">
              <span className="font-serif text-base font-bold text-plum">R</span>
            </div>
            <span className="font-serif text-lg font-semibold text-ink">
              Rep<span className="text-gold">flip</span>
            </span>
          </Link>

          {/* Desktop links — hidden below md ───────────────────────────── */}
          <div className="hidden md:flex items-center gap-6">
            {businessLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClass(pathname === link.href)}>
                {link.label}
              </Link>
            ))}

            {/* For Consumers dropdown */}
            <div ref={dropRef} className="relative">
              <button
                onClick={() => setDropOpen((o) => !o)}
                className={navLinkClass(isConsumerActive || dropOpen)}
              >
                For consumers
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 border border-hairline bg-plum-raised">
                  {consumerLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setDropOpen(false)}
                      className={`block border-l-2 px-4 py-3 text-sm font-medium transition-colors ${
                        pathname === link.href
                          ? "border-gold text-ink"
                          : "border-transparent text-ink-muted hover:border-gold hover:text-ink"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/about" className={navLinkClass(pathname === "/about")}>
              About
            </Link>
          </div>

          {/* Right: CTA always visible + hamburger on mobile only ──────── */}
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="hidden rounded px-4 py-2 text-sm font-semibold text-plum transition-colors bg-gold hover:bg-gold-deep sm:block"
            >
              For businesses
            </Link>

            {/* Hamburger — visible only below md */}
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="flex md:hidden h-10 w-10 items-center justify-center border border-hairline text-ink-muted transition-colors hover:text-ink"
            >
              {menuOpen ? (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer — each link closes menu before navigating ─────── */}
      {menuOpen && (
        <div className="md:hidden border-t border-hairline bg-plum">
          <div className="mx-auto max-w-7xl px-4 py-2 flex flex-col">
            {mobileLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`border-l-2 px-4 py-3.5 text-[15px] font-medium transition-colors ${
                  pathname === link.href
                    ? "border-gold text-ink"
                    : "border-transparent text-ink-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="py-3">
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center justify-center rounded px-4 py-3 text-sm font-semibold text-plum bg-gold"
              >
                For businesses
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
