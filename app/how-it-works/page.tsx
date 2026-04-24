import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#020810]">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-32">

        {/* Label */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-1 w-6 rounded-full bg-blue-600" />
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400">For Consumers</span>
        </div>

        {/* Headline */}
        <h1 className="mb-4 text-5xl font-black leading-tight tracking-tight text-white md:text-6xl">
          Your reputation.{" "}
          <span className="gradient-text">Your rewards.</span>
        </h1>
        <p className="mb-16 max-w-xl text-lg leading-relaxed text-slate-400">
          Repflip rewards the consumers who show up, pay on time, and treat service workers with
          respect. Here&apos;s how it works.
        </p>

        {/* Steps */}
        <div className="flex flex-col gap-2">

          {/* Step 1 */}
          <div className="glass-card relative overflow-hidden rounded-2xl p-8">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-blue-600/8 blur-3xl pointer-events-none" />
            <div className="relative flex gap-6 items-start">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-600/20 text-3xl">
                ⭐
              </div>
              <div className="flex-1">
                <div className="mb-3">
                  <span className="rounded-full border border-blue-500/30 bg-blue-600/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-400">
                    Step 1
                  </span>
                </div>
                <h2 className="mb-2 text-2xl font-black text-white">Get reviewed</h2>
                <p className="leading-relaxed text-slate-400">
                  After each service appointment, the business rates you. They leave behavioral tags —
                  the same way you&apos;d rate them on Yelp, but flipped. Your tags build your
                  reputation across every provider you work with.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Showed up on time", "Paid immediately", "Easy to communicate", "Respectful"].map(
                    (tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-emerald-800/40 bg-emerald-950/50 px-3 py-1 text-xs font-medium text-emerald-400"
                      >
                        ✓ {tag}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Connector */}
          <div className="flex justify-center py-1">
            <div className="h-8 w-px bg-gradient-to-b from-blue-600/40 to-blue-600/10" />
          </div>

          {/* Step 2 */}
          <div className="glass-card relative overflow-hidden rounded-2xl p-8">
            <div className="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-emerald-600/6 blur-3xl pointer-events-none" />
            <div className="relative flex gap-6 items-start">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-600/20 text-3xl">
                📈
              </div>
              <div className="flex-1">
                <div className="mb-3">
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-600/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Step 2
                  </span>
                </div>
                <h2 className="mb-2 text-2xl font-black text-white">Build your score</h2>
                <p className="leading-relaxed text-slate-400">
                  Every positive review lifts your Repflip score — a number from 0 to 100 that reflects your
                  reputation across every service provider you&apos;ve worked with. Higher score means better
                  tier, more perks, and priority access to top businesses.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { tier: "Bronze", range: "0–54", color: "#cd7f32" },
                    { tier: "Silver", range: "55–74", color: "#9ca3af" },
                    { tier: "Gold", range: "75–89", color: "#f59e0b" },
                    { tier: "Platinum", range: "90–100", color: "#bae6fd" },
                  ].map((t) => (
                    <div
                      key={t.tier}
                      className="rounded-xl border border-blue-900/40 bg-blue-950/30 p-3 text-center"
                    >
                      <div className="mb-0.5 text-sm font-bold" style={{ color: t.color }}>
                        {t.tier}
                      </div>
                      <div className="text-xs text-slate-500">{t.range}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Connector */}
          <div className="flex justify-center py-1">
            <div className="h-8 w-px bg-gradient-to-b from-blue-600/40 to-blue-600/10" />
          </div>

          {/* Step 3 */}
          <div className="glass-card relative overflow-hidden rounded-2xl p-8">
            <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-yellow-500/6 blur-3xl pointer-events-none" />
            <div className="relative flex gap-6 items-start">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-yellow-500/30 bg-yellow-600/20 text-3xl">
                🎁
              </div>
              <div className="flex-1">
                <div className="mb-3">
                  <span className="rounded-full border border-yellow-500/30 bg-yellow-600/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-yellow-400">
                    Step 3
                  </span>
                </div>
                <h2 className="mb-2 text-2xl font-black text-white">Earn rewards</h2>
                <p className="leading-relaxed text-slate-400">
                  Good behavior earns you points — and points are real money. Every 100 points = $1.
                  Spend them on gift cards, enter monthly cash prize draws, or redeem for discounts with
                  local partner businesses.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {[
                    { emoji: "🎰", label: "Monthly Cash Draw", desc: "500 pts / entry" },
                    { emoji: "🛍️", label: "Partner Discounts", desc: "Local businesses" },
                    { emoji: "💳", label: "Gift Cards", desc: "Amazon & Visa" },
                  ].map((r) => (
                    <div
                      key={r.label}
                      className="flex items-center gap-2.5 rounded-xl border border-yellow-900/30 bg-yellow-950/20 px-4 py-2.5"
                    >
                      <span className="text-xl">{r.emoji}</span>
                      <div>
                        <div className="text-sm font-semibold text-white">{r.label}</div>
                        <div className="text-xs text-slate-500">{r.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 glass-card relative overflow-hidden rounded-2xl p-10 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 pointer-events-none" />
          <div className="relative">
            <div className="mb-4 text-5xl">🏆</div>
            <h3 className="mb-2 text-2xl font-black text-white">
              Ready to build your reputation?
            </h3>
            <p className="mb-6 text-slate-400">
              Your Repflip profile is created automatically the first time any business reviews you.
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link
                href="/profile"
                className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:scale-[1.02]"
              >
                View Your Profile →
              </Link>
              <Link
                href="/rewards"
                className="rounded-xl border border-blue-800/40 bg-blue-950/30 px-8 py-3 text-sm font-bold text-slate-300 transition-all hover:text-white hover:border-blue-700/40"
              >
                Browse Rewards
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
