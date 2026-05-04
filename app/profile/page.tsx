"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { CONSUMERS, TIER_CONFIG, type Consumer, type Tier } from "@/lib/data";

// Points breakdown data (100 pts = $1)
const POINTS_BREAKDOWN: Record<string, { earned: number; spent: number }> = {
  "1": { earned: 6200, spent: 1380 },
  "2": { earned: 2940, spent: 800 },
  "3": { earned: 1080, spent: 200 },
  "4": { earned: 280, spent: 70 },
};

const TIPS = [
  { emoji: "⏰", title: "Show up on time", desc: "Being present and ready earns the highest-trust tag. Consistency builds your score fastest." },
  { emoji: "💳", title: "Pay without disputes", desc: '"Paid immediately" is the top-weighted positive tag. Prompt payment boosts every review.' },
  { emoji: "💬", title: "Communicate proactively", desc: "Send a heads-up if plans change. Easy to communicate reviews lift scores across all providers." },
];

function getTierProgress(score: number, tier: Tier) {
  if (tier === "Platinum") return { pct: 100, nextTier: null, pointsToNext: 0, max: 100, min: 90 };
  if (tier === "Gold") return { pct: ((score - 75) / 15) * 100, nextTier: "Platinum" as Tier, pointsToNext: 90 - score, max: 90, min: 75 };
  if (tier === "Silver") return { pct: ((score - 55) / 20) * 100, nextTier: "Gold" as Tier, pointsToNext: 75 - score, max: 75, min: 55 };
  return { pct: (score / 55) * 100, nextTier: "Silver" as Tier, pointsToNext: 55 - score, max: 55, min: 0 };
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`h-4 w-4 ${i <= rating ? "star-filled" : "star-empty"}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function ScoreCircle({ score, tier }: { score: number; tier: Consumer["tier"] }) {
  const cfg = TIER_CONFIG[tier];
  const circumference = 2 * Math.PI * 56;
  const progress = (score / 100) * circumference;
  return (
    <div className="relative flex h-44 w-44 items-center justify-center">
      <div className="absolute inset-0 rounded-full opacity-20 blur-xl" style={{ backgroundColor: cfg.color }} />
      <svg className="absolute h-44 w-44 -rotate-90" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r="56" fill="none" stroke="rgba(37,99,235,0.08)" strokeWidth="10" />
        <circle
          cx="65" cy="65" r="56" fill="none" stroke={cfg.color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={`${progress} ${circumference}`}
          style={{ filter: `drop-shadow(0 0 8px ${cfg.color}80)` }}
        />
      </svg>
      <div className="relative z-10 text-center">
        <div className="text-6xl font-black leading-none text-white">{score}</div>
        <div className="mt-1 text-sm font-medium text-slate-500">out of 100</div>
      </div>
    </div>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "1";
  const consumer = CONSUMERS.find((c) => c.id === id) ?? CONSUMERS[0];
  const cfg = TIER_CONFIG[consumer.tier];
  const breakdown = POINTS_BREAKDOWN[consumer.id] ?? { earned: consumer.points, spent: 0 };
  const tierProgress = getTierProgress(consumer.score, consumer.tier);
  const nextCfg = tierProgress.nextTier ? TIER_CONFIG[tierProgress.nextTier] : null;

  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "positive" | "concerns">("all");

  const handleClaim = () => {
    setClaiming(true);
    setTimeout(() => { setClaiming(false); setClaimed(true); }, 1000);
  };

  const allTags = consumer.reviews.flatMap((r) => r.tags);
  const negativeSet = new Set(["No-show", "Disputed payment", "Aggressive", "Scope creep"]);
  const positiveTagCounts: Record<string, number> = {};
  const negativeTagCounts: Record<string, number> = {};
  allTags.forEach((t) => {
    if (negativeSet.has(t)) negativeTagCounts[t] = (negativeTagCounts[t] ?? 0) + 1;
    else positiveTagCounts[t] = (positiveTagCounts[t] ?? 0) + 1;
  });

  const avgRating =
    consumer.reviews.length > 0
      ? consumer.reviews.reduce((a, r) => a + r.rating, 0) / consumer.reviews.length
      : 0;

  const filteredReviews =
    activeTab === "positive"
      ? consumer.reviews.filter((r) => r.tags.some((t) => !negativeSet.has(t)))
      : activeTab === "concerns"
      ? consumer.reviews.filter((r) => r.tags.some((t) => negativeSet.has(t)))
      : consumer.reviews;

  return (
    <div className="min-h-screen bg-[#020810]">
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-28">

        {/* Consumer Selector */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CONSUMERS.map((c) => (
            <Link
              key={c.id}
              href={`/profile?id=${c.id}`}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                c.id === id
                  ? "border-blue-600/50 bg-blue-600/20 text-blue-300"
                  : "border-blue-900/40 bg-blue-950/20 text-slate-400 hover:border-blue-800/40 hover:text-white"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* ── Left: Score Card ── */}
          <div className="lg:col-span-1">
            <div className="glass-card relative overflow-hidden rounded-2xl p-6 shadow-card-glow sticky top-24">
              <div
                className="absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-10 blur-3xl"
                style={{ backgroundColor: cfg.color }}
              />

              {/* Avatar + Name */}
              <div className="relative mb-5 text-center">
                <div
                  className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}10)`, border: `1px solid ${cfg.color}25` }}
                >
                  {consumer.name.charAt(0)}
                </div>
                <h1 className="text-xl font-black text-white">{consumer.name}</h1>
                <p className="mt-0.5 text-sm text-slate-400">{consumer.city}</p>
                <p className="mt-0.5 text-xs text-slate-600">Profile created {consumer.memberSince}</p>
                <div className="mt-3 flex flex-col gap-1.5 text-left">
                  <div className="flex items-center gap-2 rounded-lg border border-blue-900/40 bg-blue-950/30 px-3 py-1.5">
                    <svg className="h-3.5 w-3.5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-xs text-slate-400">{consumer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-blue-900/40 bg-blue-950/30 px-3 py-1.5">
                    <svg className="h-3.5 w-3.5 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-slate-400 break-all">{consumer.email}</span>
                  </div>
                </div>
              </div>

              {/* Score Ring */}
              <div className="relative mb-5 flex justify-center score-ring rounded-full">
                <ScoreCircle score={consumer.score} tier={consumer.tier} />
              </div>

              {/* Tier Badge */}
              <div
                className="mb-4 flex items-center justify-center gap-2 rounded-xl border py-2.5"
                style={{ backgroundColor: `${cfg.color}12`, borderColor: `${cfg.color}30` }}
              >
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-black"
                  style={{ backgroundColor: `${cfg.color}30`, color: cfg.color }}
                >
                  {consumer.tier[0]}
                </div>
                <span className="text-sm font-bold" style={{ color: cfg.color }}>
                  {consumer.tier} Member
                </span>
              </div>

              {/* Tier Progress */}
              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    {tierProgress.nextTier ? `Progress to ${tierProgress.nextTier}` : "Max Tier Reached 🎉"}
                  </span>
                  {tierProgress.nextTier && (
                    <span className="text-xs font-semibold" style={{ color: nextCfg?.color }}>
                      {tierProgress.pointsToNext} pts to go
                    </span>
                  )}
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-blue-950/60">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(tierProgress.pct, 100)}%`,
                      background: `linear-gradient(90deg, ${cfg.color}99, ${cfg.color})`,
                      boxShadow: `0 0 8px ${cfg.color}60`,
                    }}
                  />
                </div>
              </div>

              {/* Points + $ Value */}
              <div className="mb-4 rounded-xl border border-blue-900/40 bg-blue-950/30 p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Points Balance</span>
                  <span className="text-xs font-bold text-emerald-400">
                    ${(consumer.points / 100).toFixed(2)} value
                  </span>
                </div>
                <div className="text-2xl font-black text-white">{consumer.points.toLocaleString()} pts</div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-blue-950">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                    style={{ width: `${Math.min((consumer.points / 5000) * 100, 100)}%`, boxShadow: "0 0 6px rgba(37,99,235,0.5)" }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="mb-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-blue-900/40 bg-blue-950/30 p-3 text-center">
                  <div className="text-xl font-black text-white">{consumer.reviews.length}</div>
                  <div className="text-xs text-slate-500">Reviews</div>
                </div>
                <div className="rounded-xl border border-blue-900/40 bg-blue-950/30 p-3 text-center">
                  <div className="text-xl font-black text-white">
                    {consumer.reviews.length > 0 ? avgRating.toFixed(1) : "—"}
                  </div>
                  <div className="text-xs text-slate-500">Avg Rating</div>
                </div>
              </div>

              {/* Top Tags */}
              <div className="mb-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Top Traits</p>
                <div className="flex flex-col gap-1.5">
                  {Object.entries(positiveTagCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([tag, count]) => (
                      <div key={tag} className="flex items-center justify-between rounded-lg border border-emerald-900/30 bg-emerald-950/30 px-3 py-1.5">
                        <span className="text-xs font-medium text-emerald-400">{tag}</span>
                        <span className="text-xs text-emerald-600">{count}×</span>
                      </div>
                    ))}
                  {Object.entries(negativeTagCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(([tag, count]) => (
                      <div key={tag} className="flex items-center justify-between rounded-lg border border-red-900/30 bg-red-950/30 px-3 py-1.5">
                        <span className="text-xs font-medium text-red-400">{tag}</span>
                        <span className="text-xs text-red-600">{count}×</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Claim Button */}
              {claimed ? (
                <div className="w-full rounded-xl border border-emerald-700/40 bg-emerald-950/40 py-3 text-center">
                  <p className="text-sm font-bold text-emerald-400">✓ Profile Claimed</p>
                  <p className="mt-0.5 text-xs text-emerald-700">Verification pending</p>
                </div>
              ) : (
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full rounded-xl border border-blue-700/40 bg-blue-900/30 py-3 text-sm font-bold text-blue-300 transition-all hover:bg-blue-800/40 hover:text-white disabled:opacity-60"
                >
                  {claiming ? "Verifying…" : "Claim This Profile"}
                </button>
              )}
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Review History */}
            <div className="glass-card rounded-2xl p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-black text-white">Review History</h2>
                <span className="text-xs text-slate-500">{consumer.reviews.length} reviews</span>
              </div>

              {/* Tabs */}
              <div className="mb-5 flex gap-1 rounded-xl border border-blue-900/30 bg-blue-950/20 p-1">
                {(["all", "positive", "concerns"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-all ${
                      activeTab === tab
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    {tab === "all"
                      ? `All (${consumer.reviews.length})`
                      : tab === "positive"
                      ? "Positive"
                      : "Concerns"}
                  </button>
                ))}
              </div>

              {filteredReviews.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-600">No reviews in this category</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {filteredReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-blue-900/30 bg-blue-950/20 p-5 transition-all hover:border-blue-800/40 hover:bg-blue-950/30"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-white">{review.businessType}</h3>
                          <p className="text-xs text-slate-500">Verified review · anonymous</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <StarDisplay rating={review.rating} />
                          <p className="mt-1 text-xs text-slate-600">{review.date}</p>
                        </div>
                      </div>
                      {review.notes && (
                        <p className="mb-3 border-l-2 border-blue-800/40 pl-3 text-sm leading-relaxed text-slate-400">
                          &ldquo;{review.notes}&rdquo;
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {review.tags.map((tag) => {
                          const isNeg = negativeSet.has(tag);
                          return (
                            <span
                              key={tag}
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                                isNeg
                                  ? "border-red-800/30 bg-red-950/40 text-red-400"
                                  : "border-emerald-800/30 bg-emerald-950/40 text-emerald-400"
                              }`}
                            >
                              {isNeg ? "✕" : "✓"} {tag}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* How Your Data Is Protected */}
            <div className="glass-card rounded-2xl p-6">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-lg">🔒</span>
                <h2 className="text-lg font-black text-white">How Your Data Is Protected</h2>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex gap-3 rounded-xl border border-blue-900/30 bg-blue-950/20 p-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-blue-900/40 bg-blue-950/40 text-base">
                    🚫
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Your score is never public</div>
                    <div className="mt-0.5 text-xs leading-relaxed text-slate-400">Your Repflip score is private. It is never displayed publicly or shared with anyone outside of participating businesses.</div>
                  </div>
                </div>
                <div className="flex gap-3 rounded-xl border border-blue-900/30 bg-blue-950/20 p-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-blue-900/40 bg-blue-950/40 text-base">
                    ✅
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Only verified businesses can view your score</div>
                    <div className="mt-0.5 text-xs leading-relaxed text-slate-400">Only verified, paying businesses on the Repflip platform can look up your score — and only when they have an active booking relationship.</div>
                  </div>
                </div>
                <div className="flex gap-3 rounded-xl border border-blue-900/30 bg-blue-950/20 p-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-blue-900/40 bg-blue-950/40 text-base">
                    🕶️
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Business names are never revealed</div>
                    <div className="mt-0.5 text-xs leading-relaxed text-slate-400">You will never know which specific company reviewed you — only the trade category (e.g. "Plumbing Service") is shown. Reviews are always anonymous.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Points Breakdown */}
            <div className="glass-card relative overflow-hidden rounded-2xl p-6">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-600/8 blur-2xl pointer-events-none" />
              <h2 className="mb-4 text-lg font-black text-white">Points Breakdown</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/20 p-4 text-center">
                  <div className="text-xl font-black text-emerald-400">{breakdown.earned.toLocaleString()}</div>
                  <div className="mt-0.5 text-xs text-slate-500">Total Earned</div>
                </div>
                <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-4 text-center">
                  <div className="text-xl font-black text-red-400">{breakdown.spent.toLocaleString()}</div>
                  <div className="mt-0.5 text-xs text-slate-500">Total Spent</div>
                </div>
                <div className="rounded-xl border border-blue-900/40 bg-blue-950/30 p-4 text-center">
                  <div className="text-xl font-black text-white">{consumer.points.toLocaleString()}</div>
                  <div className="mt-0.5 text-xs text-slate-500">Balance</div>
                </div>
                <div className="rounded-xl border border-yellow-900/30 bg-yellow-950/20 p-4 text-center">
                  <div className="text-xl font-black text-yellow-400">
                    ${(consumer.points / 100).toFixed(2)}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">$ Value</div>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-slate-600">100 points = $1.00 · Points never expire</p>
            </div>

            {/* How to Improve */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="mb-4 text-lg font-black text-white">💡 How to Improve Your Score</h2>
              <div className="flex flex-col gap-3">
                {TIPS.map((tip) => (
                  <div
                    key={tip.title}
                    className="flex gap-4 rounded-xl border border-blue-900/30 bg-blue-950/20 p-4"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-blue-900/40 bg-blue-950/40 text-xl">
                      {tip.emoji}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{tip.title}</div>
                      <div className="mt-0.5 text-xs leading-relaxed text-slate-400">{tip.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards CTA */}
            <div className="glass-card relative overflow-hidden rounded-2xl p-6">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-500/10 blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xl">🏅</span>
                    <span className="text-sm font-bold text-white">
                      {consumer.points.toLocaleString()} points ·{" "}
                      <span className="text-emerald-400">${(consumer.points / 100).toFixed(2)}</span>
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Redeem for discounts, gift cards, and monthly prize draws.
                    {consumer.tier !== "Platinum" && " Keep earning to reach the next tier."}
                  </p>
                </div>
                <Link
                  href="/rewards"
                  className="shrink-0 rounded-xl border border-yellow-600/40 bg-yellow-950/30 px-5 py-2.5 text-sm font-bold text-yellow-400 transition-all hover:bg-yellow-900/40 hover:text-yellow-300"
                >
                  View Rewards
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#020810]">
          <div className="text-slate-500">Loading profile…</div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
