"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import { CONSUMERS, TIER_CONFIG, type Consumer } from "@/lib/data";

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
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full opacity-20 blur-xl"
        style={{ backgroundColor: cfg.color }}
      />
      <svg className="absolute h-44 w-44 -rotate-90" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r="56" fill="none" stroke="rgba(37,99,235,0.08)" strokeWidth="10" />
        <circle
          cx="65"
          cy="65"
          r="56"
          fill="none"
          stroke={cfg.color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
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

function PointsMeter({ points }: { points: number }) {
  const max = 5000;
  const pct = Math.min((points / max) * 100, 100);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Points Balance</span>
        <span className="text-sm font-bold text-white">{points.toLocaleString()} pts</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-blue-950/60">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all"
          style={{ width: `${pct}%`, boxShadow: "0 0 8px rgba(37,99,235,0.5)" }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate-600">
        <span>0</span>
        <span>{max.toLocaleString()} pts to max</span>
      </div>
    </div>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "1";
  const consumer = CONSUMERS.find((c) => c.id === id) ?? CONSUMERS[0];
  const cfg = TIER_CONFIG[consumer.tier];

  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "positive" | "concerns">("all");

  const handleClaim = () => {
    setClaiming(true);
    setTimeout(() => {
      setClaiming(false);
      setClaimed(true);
    }, 1000);
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
      <Navbar />
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
                  : "border-blue-900/40 bg-blue-950/20 text-slate-400 hover:text-white hover:border-blue-800/40"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* Left: Score Card */}
          <div className="lg:col-span-1">
            <div className="glass-card relative overflow-hidden rounded-2xl p-6 shadow-card-glow sticky top-24">
              <div
                className="absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-10 blur-3xl"
                style={{ backgroundColor: cfg.color }}
              />

              {/* Avatar + Name */}
              <div className="relative mb-6 text-center">
                <div
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-black text-white"
                  style={{ background: `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}10)`, border: `1px solid ${cfg.color}25` }}
                >
                  {consumer.name.charAt(0)}
                </div>
                <h1 className="text-xl font-black text-white">{consumer.name}</h1>
                <p className="mt-0.5 text-sm text-slate-400">{consumer.email}</p>
                <p className="text-xs text-slate-600 mt-0.5">Member since {consumer.memberSince}</p>
              </div>

              {/* Score Ring */}
              <div className="relative mb-6 flex justify-center score-ring rounded-full">
                <ScoreCircle score={consumer.score} tier={consumer.tier} />
              </div>

              {/* Tier Badge */}
              <div
                className="mb-6 flex items-center justify-center gap-2 rounded-xl border py-2.5"
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

              {/* Points */}
              <div className="mb-6">
                <PointsMeter points={consumer.points} />
              </div>

              {/* Stats Row */}
              <div className="mb-6 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-blue-900/40 bg-blue-950/30 p-3 text-center">
                  <div className="text-xl font-black text-white">{consumer.reviews.length}</div>
                  <div className="text-xs text-slate-500">Reviews</div>
                </div>
                <div className="rounded-xl border border-blue-900/40 bg-blue-950/30 p-3 text-center">
                  <div className="text-xl font-black text-white">{avgRating.toFixed(1)}</div>
                  <div className="text-xs text-slate-500">Avg Rating</div>
                </div>
              </div>

              {/* Top Tags */}
              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Top Traits</p>
                <div className="flex flex-col gap-1.5">
                  {Object.entries(positiveTagCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([tag, count]) => (
                      <div key={tag} className="flex items-center justify-between rounded-lg bg-emerald-950/30 border border-emerald-900/30 px-3 py-1.5">
                        <span className="text-xs font-medium text-emerald-400">{tag}</span>
                        <span className="text-xs text-emerald-600">{count}×</span>
                      </div>
                    ))}
                  {Object.entries(negativeTagCounts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 2)
                    .map(([tag, count]) => (
                      <div key={tag} className="flex items-center justify-between rounded-lg bg-red-950/30 border border-red-900/30 px-3 py-1.5">
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
                  <p className="text-xs text-emerald-700 mt-0.5">Verification pending</p>
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

          {/* Right: Review History */}
          <div className="lg:col-span-2">
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
                    {tab === "all" ? `All (${consumer.reviews.length})` : tab === "positive" ? "Positive" : "Concerns"}
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
                          <h3 className="font-bold text-white">{review.businessName}</h3>
                          <p className="text-xs text-slate-500">{review.businessType}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <StarDisplay rating={review.rating} />
                          <p className="mt-1 text-xs text-slate-600">{review.date}</p>
                        </div>
                      </div>

                      {review.notes && (
                        <p className="mb-3 text-sm leading-relaxed text-slate-400 border-l-2 border-blue-800/40 pl-3">
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
                                  ? "bg-red-950/40 text-red-400 border-red-800/30"
                                  : "bg-emerald-950/40 text-emerald-400 border-emerald-800/30"
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

            {/* Rewards CTA */}
            <div className="mt-4 glass-card relative overflow-hidden rounded-2xl p-6">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-yellow-500/10 blur-2xl" />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xl">🏅</span>
                    <span className="text-sm font-bold text-white">
                      {consumer.points.toLocaleString()} points available
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Redeem for discounts with 200+ partner businesses.
                    {consumer.tier !== "Platinum" && " Keep earning to reach the next tier."}
                  </p>
                </div>
                <button className="shrink-0 rounded-xl border border-yellow-600/40 bg-yellow-950/30 px-5 py-2.5 text-sm font-bold text-yellow-400 transition-all hover:bg-yellow-900/40 hover:text-yellow-300">
                  Redeem
                </button>
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
    <Suspense fallback={
      <div className="min-h-screen bg-[#020810] flex items-center justify-center">
        <div className="text-slate-500">Loading profile…</div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
