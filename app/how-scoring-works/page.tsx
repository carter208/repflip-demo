import Link from "next/link";
import { SCORE_BASELINE, TAG_WEIGHTS, BEHAVIORAL_TAGS, getTierFromScore } from "@/lib/data";

// Tier ranges are derived by scanning every possible score against the real
// getTierFromScore function — never hand-typed — so this page can't drift
// out of sync with the actual tier thresholds.
function getTierRanges() {
  const ranges: { tier: string; min: number; max: number }[] = [];
  let currentTier = getTierFromScore(0);
  let start = 0;
  for (let score = 1; score <= 100; score++) {
    const tier = getTierFromScore(score);
    if (tier !== currentTier) {
      ranges.push({ tier: currentTier, min: start, max: score - 1 });
      currentTier = tier;
      start = score;
    }
  }
  ranges.push({ tier: currentTier, min: start, max: 100 });
  return ranges;
}

const TIER_COLORS: Record<string, string> = {
  Bronze: "#cd7f32",
  Silver: "#9ca3af",
  Gold: "#f59e0b",
  Platinum: "#bae6fd",
};

export default function HowScoringWorksPage() {
  const tierRanges = getTierRanges();
  const orderedTags = BEHAVIORAL_TAGS.map((t) => ({
    label: t.label,
    positive: t.positive,
    weight: TAG_WEIGHTS[t.label] ?? 0,
  }));

  return (
    <div className="min-h-screen bg-[#020810]">
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        {/* Label */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-1 w-6 rounded-full bg-blue-600" />
          <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Methodology</span>
        </div>

        <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl">
          How your score is calculated
        </h1>
        <p className="mb-12 max-w-xl text-lg leading-relaxed text-slate-400">
          No hidden formula. Every reputation score on Repflip is built the same simple way,
          and this page states the whole thing — the same numbers used everywhere else in
          the product.
        </p>

        {/* The formula */}
        <div className="glass-card relative overflow-hidden rounded-2xl p-8 mb-6">
          <h2 className="mb-3 text-xl font-black text-white">The formula</h2>
          <p className="mb-4 leading-relaxed text-slate-400">
            Your score starts at a fixed baseline, then moves up or down by the weight of
            every behavioral tag on every review you&apos;ve received. The result is clamped
            to the 0–100 range.
          </p>
          <div className="rounded-xl border border-blue-900/40 bg-blue-950/30 p-4 text-center font-mono text-sm text-blue-300">
            score = clamp( {SCORE_BASELINE} + sum of (tag weight × how many times you got that tag), 0, 100 )
          </div>
        </div>

        {/* Baseline */}
        <div className="glass-card relative overflow-hidden rounded-2xl p-8 mb-6">
          <h2 className="mb-3 text-xl font-black text-white">
            Why start at {SCORE_BASELINE}?
          </h2>
          <p className="leading-relaxed text-slate-400">
            Every consumer starts at {SCORE_BASELINE} — inside the Silver range — before their
            first review. That&apos;s a deliberate middle ground: a brand-new consumer hasn&apos;t
            done anything to earn a top-tier score, but they also haven&apos;t done anything to
            be treated as high-risk. {SCORE_BASELINE} gives real reviews, positive or negative,
            room to move the score in either direction.
          </p>
        </div>

        {/* Tag weights table */}
        <div className="glass-card relative overflow-hidden rounded-2xl p-8 mb-6">
          <h2 className="mb-1 text-xl font-black text-white">Every tag and its weight</h2>
          <p className="mb-5 text-sm text-slate-500">
            This is the complete list — the same weights used in the score breakdown on every profile.
          </p>
          <div className="flex flex-col gap-2">
            {orderedTags.map((tag) => (
              <div
                key={tag.label}
                className={`flex items-center justify-between rounded-xl border px-4 py-2.5 ${
                  tag.positive ? "border-emerald-900/30 bg-emerald-950/20" : "border-red-900/30 bg-red-950/20"
                }`}
              >
                <span className="text-sm font-medium text-slate-200">{tag.label}</span>
                <span className={`text-sm font-black ${tag.positive ? "text-emerald-400" : "text-red-400"}`}>
                  {tag.weight > 0 ? "+" : ""}
                  {tag.weight} per review
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-600">
            A tag applies once per review it appears on — three reviews all tagged
            &ldquo;Paid on time&rdquo; count three times.
          </p>
        </div>

        {/* Tier thresholds */}
        <div className="glass-card relative overflow-hidden rounded-2xl p-8 mb-10">
          <h2 className="mb-5 text-xl font-black text-white">What your score means</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tierRanges.map((t) => (
              <div key={t.tier} className="rounded-xl border border-blue-900/40 bg-blue-950/30 p-3 text-center">
                <div className="mb-0.5 text-sm font-bold" style={{ color: TIER_COLORS[t.tier] }}>
                  {t.tier}
                </div>
                <div className="text-xs text-slate-500">
                  {t.min}–{t.max}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="glass-card relative overflow-hidden rounded-2xl p-10 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 pointer-events-none" />
          <div className="relative">
            <h3 className="mb-2 text-2xl font-black text-white">See it applied to a real profile</h3>
            <p className="mb-6 text-slate-400">
              Every profile shows this same math worked out for that specific consumer&apos;s reviews.
            </p>
            <Link
              href="/profile"
              className="rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:scale-[1.02]"
            >
              View a profile →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
