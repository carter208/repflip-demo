import Link from "next/link";
import { TIER_CONFIG } from "@/lib/data";

const TIERS: { tier: keyof typeof TIER_CONFIG; range: string }[] = [
  { tier: "Bronze", range: "0–54" },
  { tier: "Silver", range: "55–74" },
  { tier: "Gold", range: "75–89" },
  { tier: "Platinum", range: "90–100" },
];

const REWARD_TYPES = [
  { label: "Monthly cash draw", desc: "500 pts / entry" },
  { label: "Partner discounts", desc: "Local businesses" },
  { label: "Gift cards", desc: "Amazon & Visa" },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-plum">
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-32">
        {/* Label */}
        <p className="mb-4 text-sm font-medium text-gold">For consumers</p>

        {/* Headline */}
        <h1 className="mb-4 font-serif text-5xl font-semibold leading-tight text-ink md:text-6xl">
          Your reputation. Your rewards.
        </h1>
        <p className="mb-16 max-w-xl text-lg leading-relaxed text-ink-muted">
          Repflip rewards the consumers who show up, pay on time, and treat the people they do
          business with respect. Here&apos;s how it works.
        </p>

        {/* Steps */}
        <div className="flex flex-col divide-y divide-hairline border-y border-hairline">
          {/* Step 1 */}
          <div className="flex gap-6 items-start p-8">
            <span className="shrink-0 font-serif text-lg font-semibold text-gold">1</span>
            <div className="flex-1">
              <h2 className="mb-2 font-serif text-2xl font-semibold text-ink">Get reviewed</h2>
              <p className="leading-relaxed text-ink-muted">
                After each interaction, the business rates you. They leave behavioral tags —
                the same way you&apos;d rate them on Yelp, but flipped. Your tags build your
                reputation across every business you work with.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
                {["Reliable", "Paid on time", "Clear communicator", "Respectful"].map((tag) => (
                  <span key={tag} className="border-l-2 border-sage pl-2 text-sm text-ink-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-6 items-start p-8">
            <span className="shrink-0 font-serif text-lg font-semibold text-gold">2</span>
            <div className="flex-1">
              <h2 className="mb-2 font-serif text-2xl font-semibold text-ink">Build your score</h2>
              <p className="leading-relaxed text-ink-muted">
                Every positive review lifts your Repflip score — a number from 0 to 100 that reflects your
                reputation across every business you&apos;ve worked with. Higher score means better
                tier, more perks, and priority access to top businesses.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-px border border-hairline bg-hairline sm:grid-cols-4">
                {TIERS.map((t) => (
                  <div key={t.tier} className="bg-plum p-3 text-center">
                    <div className="font-serif text-sm font-semibold" style={{ color: TIER_CONFIG[t.tier].color }}>
                      {t.tier}
                    </div>
                    <div className="text-xs text-ink-muted">{t.range}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-6 items-start p-8">
            <span className="shrink-0 font-serif text-lg font-semibold text-gold">3</span>
            <div className="flex-1">
              <h2 className="mb-2 font-serif text-2xl font-semibold text-ink">Earn rewards</h2>
              <p className="leading-relaxed text-ink-muted">
                Good behavior earns you points — and points are real money. Every 100 points = $1.
                Spend them on gift cards, enter monthly cash prize draws, or redeem for discounts with
                local partner businesses.
              </p>
              <div className="mt-4 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
                {REWARD_TYPES.map((r) => (
                  <div key={r.label} className="bg-plum p-3">
                    <div className="text-sm font-semibold text-ink">{r.label}</div>
                    <div className="text-xs text-ink-muted">{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 border border-hairline bg-plum-raised p-10 text-center">
          <h3 className="mb-2 font-serif text-2xl font-semibold text-ink">
            Ready to build your reputation?
          </h3>
          <p className="mb-6 text-ink-muted">
            Your Repflip profile is created automatically the first time any business reviews you.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              href="/profile"
              className="rounded bg-gold px-8 py-3 text-sm font-semibold text-plum transition-colors hover:bg-gold-deep"
            >
              View your profile →
            </Link>
            <Link
              href="/rewards"
              className="rounded border border-hairline px-8 py-3 text-sm font-semibold text-ink transition-colors hover:border-gold hover:text-gold"
            >
              Browse rewards
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
