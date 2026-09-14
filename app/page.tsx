"use client";

import Link from "next/link";
import { useState } from "react";

const FEATURES_BUSINESS = [
  {
    title: "Instant lookup",
    desc: "Search any consumer by name or phone before you say yes. See their score, tier, and history in seconds.",
  },
  {
    title: "Submit reviews",
    desc: "Rate consumers with behavioral tags after every interaction. Your feedback shapes the platform for every business.",
  },
  {
    title: "Risk protection",
    desc: "Decline high-risk consumers before they cost you time, money, or headaches.",
  },
];

const FEATURES_CONSUMER = [
  {
    title: "Build your score",
    desc: "Every good interaction adds to your score. Prove you're a great consumer across every business you work with.",
  },
  {
    title: "Earn rewards",
    desc: "Reach Gold and Platinum tiers to unlock exclusive discounts, priority booking, and partner perks.",
  },
  {
    title: "Own your profile",
    desc: "Claim your profile, dispute inaccurate reviews, and control your reputation narrative.",
  },
];

const SIGNALS = [
  { label: "Green light", range: "Score 85+", desc: "Trusted consumer. Move forward.", color: "#8fa06a" },
  { label: "Yellow light", range: "Score 65–84", desc: "Proceed with caution. Review their history.", color: "#d4a24e" },
  { label: "Red light", range: "Score below 65", desc: "High risk. Charge more or pass.", color: "#b3564a" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="h-1.5 w-1.5 bg-gold" />
      <span className="text-sm font-medium text-gold">{children}</span>
    </div>
  );
}

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-plum">
      {/* Hero */}
      <section className="border-b border-hairline">
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-32">
          <div className="mb-8 inline-flex items-center gap-2 border border-hairline px-3 py-1.5 text-sm text-ink-muted">
            <span className="h-1.5 w-1.5 bg-gold animate-pulse" />
            Now in private beta
          </div>

          <h1 className="mb-6 max-w-3xl font-serif text-5xl font-semibold leading-tight text-ink md:text-6xl">
            Know who you&apos;re dealing with before you say yes.
          </h1>

          <p className="mb-10 max-w-xl text-lg text-ink-muted">
            Repflip is the two-sided reputation platform that lets any business rate their
            consumers — and rewards people who show up, pay on time, and treat others with
            respect.
          </p>

          <div className="mb-16 flex flex-col items-start gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="rounded bg-gold px-8 py-3.5 text-base font-semibold text-plum transition-colors hover:bg-gold-deep"
            >
              Get started free
            </Link>
            <Link
              href="/profile"
              className="rounded border border-hairline px-8 py-3.5 text-base font-semibold text-ink transition-colors hover:border-gold hover:text-gold"
            >
              View a profile
            </Link>
          </div>

          {/* Score preview — ledger-style ID card */}
          <div className="max-w-sm border border-hairline bg-plum-raised p-6">
            <div className="mb-5 flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <p className="text-sm text-ink-muted">Consumer score</p>
                <p className="mt-0.5 font-serif text-base font-semibold text-ink">Marcus Thompson</p>
              </div>
              <span className="font-serif text-sm font-semibold text-tier-platinum">Platinum</span>
            </div>
            <div className="mb-4 flex items-end gap-3">
              <span className="font-serif text-7xl font-bold leading-none text-gold">94</span>
              <span className="mb-1 text-sm text-ink-muted">out of 100</span>
            </div>
            <div className="mb-4 h-1 w-full bg-hairline">
              <div className="h-full w-[94%] bg-gold" />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {["Paid on time", "Respectful", "Clear communicator"].map((tag) => (
                <span key={tag} className="border-l-2 border-sage pl-2 text-xs text-ink-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="border-b border-hairline bg-plum-raised py-20">
        <div className="mx-auto max-w-3xl px-6">
          <SectionLabel>Our mission</SectionLabel>
          <h2 className="mb-7 font-serif text-4xl font-semibold leading-tight text-ink md:text-5xl">
            Built for the people who show up.
          </h2>
          <p className="text-lg leading-relaxed text-ink-muted">
            Repflip exists to create a fair economy of trust — where businesses of every kind can
            finally know who they&apos;re dealing with, good consumers are recognized and rewarded, and
            trust flows both ways. We believe the people who show up, pay without argument, and
            treat others with respect deserve to be known. And the businesses who serve them
            deserve to know before they say yes.
          </p>
        </div>
      </section>

      {/* For Businesses */}
      <section className="border-b border-hairline py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionLabel>For businesses</SectionLabel>
          <h2 className="mb-4 font-serif text-3xl font-semibold text-ink md:text-4xl">
            Stop taking on unknown risk
          </h2>
          <p className="mb-12 max-w-xl text-ink-muted">
            Every business — from landlords to retailers to service providers — deserves to know
            their consumer&apos;s reputation before committing their time and resources.
          </p>
          <div className="grid gap-px border border-hairline bg-hairline md:grid-cols-3">
            {FEATURES_BUSINESS.map((f) => (
              <div key={f.title} className="bg-plum p-6 transition-colors hover:bg-plum-raised">
                <h3 className="mb-2 font-serif text-lg font-semibold text-ink">{f.title}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — Traffic Light */}
      <section className="border-b border-hairline bg-plum-raised py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionLabel>How it works</SectionLabel>
          <h2 className="mb-4 font-serif text-3xl font-semibold text-ink md:text-4xl">
            One glance. Instant decision.
          </h2>
          <p className="mb-14 max-w-xl text-ink-muted">
            Every consumer lookup returns a single signal. No guessing, no reading between the lines.
            You know in seconds whether to move forward.
          </p>

          <div className="grid gap-px border border-hairline bg-hairline md:grid-cols-3">
            {SIGNALS.map((s) => (
              <div key={s.label} className="bg-plum p-8">
                <div className="mb-5 h-12 w-12 rounded-full" style={{ backgroundColor: s.color }} />
                <h3 className="mb-1 font-serif text-xl font-semibold text-ink">{s.label}</h3>
                <p className="mb-3 text-sm font-medium" style={{ color: s.color }}>{s.range}</p>
                <p className="text-ink-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Consumers */}
      <section className="border-b border-hairline py-24">
        <div className="mx-auto max-w-6xl px-6">
          <SectionLabel>For consumers</SectionLabel>
          <h2 className="mb-4 font-serif text-3xl font-semibold text-ink md:text-4xl">
            Good behavior has its rewards
          </h2>
          <p className="mb-12 max-w-xl text-ink-muted">
            Your reputation follows you. Build a strong score and unlock exclusive perks from the
            businesses you rely on.
          </p>
          <div className="grid gap-px border border-hairline bg-hairline md:grid-cols-3">
            {FEATURES_CONSUMER.map((f) => (
              <div key={f.title} className="bg-plum p-6 transition-colors hover:bg-plum-raised">
                <h3 className="mb-2 font-serif text-lg font-semibold text-ink">{f.title}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Email Capture */}
      <section className="py-24">
        <div className="mx-auto max-w-2xl px-6">
          <div className="border border-hairline bg-plum-raised p-10 text-center">
            <p className="mb-4 text-sm font-medium text-gold">Early access</p>
            <h2 className="mb-4 font-serif text-3xl font-semibold text-ink md:text-4xl">
              Join the waitlist. Shape the platform.
            </h2>
            <p className="mb-8 text-ink-muted">
              Businesses that join during early access get free access for the first year,
              locked-in pricing forever, and direct input on platform features.
            </p>

            {submitted ? (
              <div className="border border-hairline bg-plum p-6 text-left">
                <p className="text-lg font-semibold text-ink">You&apos;re on the list.</p>
                <p className="mt-1 text-sm text-ink-muted">
                  We&apos;ll reach out at <span className="text-gold">{email}</span> when
                  early access is ready for you.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 border border-hairline bg-plum px-5 py-3.5 text-base text-ink placeholder-ink-muted outline-none transition-colors focus:border-gold"
                />
                <button
                  type="submit"
                  className="whitespace-nowrap rounded bg-gold px-8 py-3.5 text-base font-semibold text-plum transition-colors hover:bg-gold-deep"
                >
                  Join the waitlist
                </button>
              </form>
            )}
            <p className="mt-4 text-xs text-ink-muted">
              No spam. No credit card. Cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-hairline py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center bg-gold">
                <span className="font-serif text-sm font-bold text-plum">R</span>
              </div>
              <span className="font-serif text-base font-semibold text-ink">
                Rep<span className="text-gold">flip</span>
              </span>
            </div>
            <p className="text-sm text-ink-muted">
              © 2026 Repflip, Inc. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-ink-muted">
              <a href="#" className="transition-colors hover:text-gold">Privacy</a>
              <a href="#" className="transition-colors hover:text-gold">Terms</a>
              <a href="#" className="transition-colors hover:text-gold">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
