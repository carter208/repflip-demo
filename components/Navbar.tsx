"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const businessLinks = [
  { href: "/dashboard", label: "Business Dashboard" },
  { href: "/submit-review", label: "Submit Review" },
];

const consumerLinks = [
  { href: "/profile", label: "Consumer Profile", emoji: "👤" },
  { href: "/rewards", label: "Rewards", emoji: "🏆" },
  { href: "/how-it-works", label: "How It Works", emoji: "💡" },
];

const otherLinks = [{ href: "/about", label: "About" }];

const consumerHrefs = consumerLinks.map((l) => l.href);

export default function Navbar() {
  const pathname = usePathname();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const isConsumerActive = consumerHrefs.includes(pathname);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-blue-950/60 bg-[#020810]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-600/30">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white" fillOpacity="0.9" />
                <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="white" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Rep<span className="text-blue-400">flip</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden items-center gap-1 md:flex">
            {/* Business links */}
            {businessLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-blue-600/20 text-blue-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* For Consumers dropdown */}
            <div ref={dropRef} className="relative">
              <button
                onClick={() => setDropOpen((o) => !o)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  isConsumerActive || dropOpen
                    ? "bg-blue-600/20 text-blue-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                For Consumers
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${dropOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 overflow-hidden rounded-xl border border-blue-900/40 bg-[#040d21]/95 shadow-xl shadow-black/50 backdrop-blur-xl">
                  {consumerLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setDropOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all hover:bg-blue-900/30 ${
                        pathname === link.href ? "text-blue-300 bg-blue-900/20" : "text-slate-300 hover:text-white"
                      }`}
                    >
                      <span>{link.emoji}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Other links */}
            {otherLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "bg-blue-600/20 text-blue-300"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/30"
          >
            For Businesses
          </Link>
        </div>
      </div>
    </nav>
  );
}
