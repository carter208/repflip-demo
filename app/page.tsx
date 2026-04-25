"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";

const FEATURES_BUSINESS = [
  {
    icon: "🔍",
    title: "Instant Lookup",
    desc: "Search any customer by name or phone before booking. See their score, tier, and history in seconds.",
  },
  {
    icon: "⭐",
    title: "Submit Reviews",
    desc: "Rate clients with behavioral tags after every job. Your feedback shapes the platform for all service pros.",
  },
  {
    icon: "🛡️",
    title: "Risk Protection",
    desc: "Decline high-risk customers before they cost you time, money, or headaches.",
  },
];

const FEATURES_CONSUMER = [
  {
    icon: "📈",
    title: "Build Your Score",
    desc: "Every good interaction adds to your reputation score. Prove you're a great client across all service providers.",
  },
  {
    icon: "🏅",
    title: "Earn Rewards",
    desc: "Reach Gold and Platinum tiers to unlock exclusive discounts, priority booking, and partner perks.",
  },
  {
    icon: "🔒",
    title: "Own Your Profile",
    desc: "Claim your profile, dispute inaccurate reviews, and control your reputation narrative.",
  },
];



export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#020810]">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24">
        <div className="hero-grid absolute inset-0 opacity-60" />
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-800/40 bg-blue-950/40 px-4 py-1.5 text-sm text-blue-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            Now in Private Beta — Limited Founding Memberships Available
          </div>

          <h1 className="mb-6 text-5xl font-black leading-tight tracking-tight text-white md:text-7xl">
            Know who you&apos;re working
            <br />
            <span className="gradient-text">with before the job starts.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 md:text-xl">
            Repflip is the two-sided reputation platform that lets service businesses rate their
            customers — and rewards consumers who show up, pay on time, and treat workers with
            respect.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 hover:scale-105"
            >
              Get Started Free
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/profile"
              className="rounded-xl border border-blue-800/50 bg-blue-950/30 px-8 py-4 text-base font-semibold text-blue-300 backdrop-blur-sm transition-all hover:border-blue-600/60 hover:bg-blue-900/30 hover:text-white"
            >
              Get Started
            </Link>
          </div>

          {/* Score preview card */}
          <div className="mx-auto mt-16 max-w-sm">
            <div className="glass-card relative overflow-hidden rounded-2xl p-6 shadow-2xl shadow-blue-900/30">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-600/10 blur-xl" />
              <div className="mb-4 flex items-center justify-between">
                <div className="text-left">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">Consumer Score</p>
                  <p className="mt-0.5 text-sm font-medium text-slate-300">Marcus Thompson</p>
                </div>
                <span className="rounded-full border border-sky-400/40 bg-sky-900/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-300">
                  Platinum
                </span>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-7xl font-black text-white">94</span>
                <div className="mb-3 flex flex-col gap-1">
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-blue-950">
                    <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
                  </div>
                  <p className="text-xs text-slate-500">out of 100</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Paid immediately", "Respectful", "Easy to communicate"].map((tag) => (
                  <span key={tag} className="rounded-full bg-emerald-950/50 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-800/40">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="border-y border-blue-950/40 bg-[#040d21]/70 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <span className="mb-6 inline-block rounded-full border border-blue-800/40 bg-blue-950/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-400">
            Our Mission
          </span>
          <h2 className="mb-7 text-4xl font-black leading-tight tracking-tight gradient-text md:text-5xl">
            Built for the people who show up.
          </h2>
          <p className="text-lg leading-relaxed text-slate-400 md:text-xl">
            Repflip exists to create a fair service economy — where businesses can finally know who
            they&apos;re working with, good customers are recognized and rewarded, and trust flows both
            ways. We believe the people who show up on time, pay without argument, and treat workers
            with respect deserve to be known. And the businesses who serve them deserve to know
            before the job starts.
          </p>
        </div>
      </section>

      {/* For Businesses */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-800/40" />
            <span className="rounded-full border border-blue-800/40 bg-blue-950/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-400">
              For Businesses
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-800/40" />
          </div>
          <h2 className="mb-4 text-center text-3xl font-black text-white md:text-5xl">
            Stop taking on unknown risk
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-slate-400">
            Every contractor, cleaner, plumber, and service pro deserves to know their client&apos;s
            reputation before committing their time and resources.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES_BUSINESS.map((f) => (
              <div key={f.title} className="glass-card card-shine group relative rounded-2xl p-6 transition-all hover:border-blue-700/40 hover:shadow-xl hover:shadow-blue-900/20">
                <div className="mb-4 text-3xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works — Traffic Light */}
      <section className="py-24 bg-[#040d21]/60">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-800/40" />
            <span className="rounded-full border border-blue-800/40 bg-blue-950/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-400">
              How It Works
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-800/40" />
          </div>
          <h2 className="mb-4 text-center text-3xl font-black text-white md:text-5xl">
            One glance. Instant decision.
          </h2>
          <p className="mx-auto mb-16 max-w-xl text-center text-slate-400">
            Every consumer lookup returns a single signal. No guessing, no reading between the lines.
            You know in seconds whether to take the job.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Green */}
            <div className="glass-card relative overflow-hidden rounded-2xl p-8 text-center transition-all hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 to-transparent" />
              <div className="relative">
                <div
                  className="mx-auto mb-6 h-24 w-24 rounded-full"
                  style={{
                    backgroundColor: "#22c55e",
                    boxShadow: "0 0 40px rgba(34,197,94,0.5), 0 0 80px rgba(34,197,94,0.25)",
                  }}
                />
                <h3 className="mb-1 text-2xl font-black text-emerald-400">Green Light</h3>
                <p className="mb-3 text-sm font-semibold text-emerald-600">Score 85+</p>
                <p className="text-slate-400">Trusted customer. Take the job.</p>
              </div>
            </div>

            {/* Yellow */}
            <div className="glass-card relative overflow-hidden rounded-2xl p-8 text-center transition-all hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-950/20 to-transparent" />
              <div className="relative">
                <div
                  className="mx-auto mb-6 h-24 w-24 rounded-full"
                  style={{
                    backgroundColor: "#f59e0b",
                    boxShadow: "0 0 40px rgba(245,158,11,0.5), 0 0 80px rgba(245,158,11,0.25)",
                  }}
                />
                <h3 className="mb-1 text-2xl font-black text-yellow-400">Yellow Light</h3>
                <p className="mb-3 text-sm font-semibold text-yellow-600">Score 65–84</p>
                <p className="text-slate-400">Proceed with caution. Review their history.</p>
              </div>
            </div>

            {/* Red */}
            <div className="glass-card relative overflow-hidden rounded-2xl p-8 text-center transition-all hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 to-transparent" />
              <div className="relative">
                <div
                  className="mx-auto mb-6 h-24 w-24 rounded-full"
                  style={{
                    backgroundColor: "#ef4444",
                    boxShadow: "0 0 40px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.25)",
                  }}
                />
                <h3 className="mb-1 text-2xl font-black text-red-400">Red Light</h3>
                <p className="mb-3 text-sm font-semibold text-red-700">Score below 65</p>
                <p className="text-slate-400">High risk. Charge more or pass.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Consumers */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-800/40" />
            <span className="rounded-full border border-blue-800/40 bg-blue-950/30 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-blue-400">
              For Consumers
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-800/40" />
          </div>
          <h2 className="mb-4 text-center text-3xl font-black text-white md:text-5xl">
            Good behavior has its rewards
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-slate-400">
            Your reputation follows you. Build a strong score and unlock exclusive perks from the
            service providers you rely on.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES_CONSUMER.map((f) => (
              <div key={f.title} className="glass-card card-shine group relative rounded-2xl p-6 transition-all hover:border-blue-700/40 hover:shadow-xl hover:shadow-blue-900/20">
                <div className="mb-4 text-3xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Email Capture */}
      <section className="py-24 bg-[#040d21]/60">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <div className="glass-card relative overflow-hidden rounded-3xl p-12">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[80px]" />
            <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-cyan-600/8 blur-[80px]" />
            <div className="relative">
              <span className="mb-4 inline-block rounded-full border border-yellow-600/40 bg-yellow-950/30 px-3 py-1 text-xs font-bold uppercase tracking-widest text-yellow-400">
                Founding Member Access
              </span>
              <h2 className="mb-4 text-3xl font-black text-white md:text-5xl">
                Join the waitlist.
                <br />
                <span className="gradient-text">Shape the platform.</span>
              </h2>
              <p className="mb-8 text-slate-400">
                Founding businesses get free access for the first year, locked-in pricing forever,
                and direct input on platform features. Only 75 spots available in the Treasure Valley.
              </p>

              {submitted ? (
                <div className="rounded-xl border border-emerald-700/40 bg-emerald-950/40 p-6">
                  <div className="mb-2 text-2xl">🎉</div>
                  <p className="text-lg font-bold text-white">You&apos;re on the list!</p>
                  <p className="mt-1 text-sm text-slate-400">
                    We&apos;ll reach out at <span className="text-blue-400">{email}</span> when your
                    founding membership is ready.
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
                    className="flex-1 rounded-xl border border-blue-800/40 bg-blue-950/40 px-5 py-4 text-base text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/60 focus:bg-blue-950/60 focus:ring-2 focus:ring-blue-600/20"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:scale-[1.02] whitespace-nowrap"
                  >
                    Claim My Spot
                  </button>
                </form>
              )}
              <p className="mt-4 text-xs text-slate-600">
                No spam. No credit card. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-950/60 py-10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" fill="white" fillOpacity="0.9" />
                  <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="white" />
                </svg>
              </div>
              <span className="text-base font-bold text-white">
                Rep<span className="text-blue-400">flip</span>
              </span>
            </div>
            <p className="text-sm text-slate-600">
              © 2026 Repflip, Inc. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-600">
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
