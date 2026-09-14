"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { CONSUMERS, TIER_CONFIG, getTierProgress, getTierFromScore, deriveScore, getCleanStreak, NEGATIVE_TAGS, FREEZE_COST, type Consumer } from "@/lib/data";
import { useScoreReveal } from "@/lib/useScoreReveal";
import { drawScoreCard } from "@/lib/shareCard";
import { SHARE_LINK_EXPIRY_DAYS, isShareLinkActive, createShareLink, revokeShareLink } from "@/lib/shareLink";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import ShareCard from "@/components/ShareCard";

// Points breakdown data (100 pts = $1)
const POINTS_BREAKDOWN: Record<string, { earned: number; spent: number }> = {
  "1": { earned: 6200, spent: 1380 },
  "2": { earned: 2940, spent: 800 },
  "3": { earned: 1080, spent: 200 },
  "4": { earned: 280, spent: 70 },
};

const TIPS = [
  { title: "Be reliable", desc: "Being present and ready earns the highest-trust tag. Consistency builds your score fastest." },
  { title: "Pay without disputes", desc: '"Paid on time" is the top-weighted positive tag. Prompt payment boosts every review.' },
  { title: "Communicate proactively", desc: "Send a heads-up if plans change. Clear communicator reviews lift scores across every business." },
];

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

function ScoreCircle({ score, revealKey }: { score: number; revealKey: string | number }) {
  const { displayScore, stampVisible } = useScoreReveal(score, revealKey, 1200);
  const circumference = 2 * Math.PI * 58;
  const progress = (displayScore / 100) * circumference;
  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      <svg className="absolute h-48 w-48 -rotate-90" viewBox="0 0 136 136">
        <circle cx="68" cy="68" r="58" fill="none" stroke="#4a3a52" strokeWidth="8" />
        <circle
          cx="68" cy="68" r="58" fill="none" stroke="#d4a24e" strokeWidth="8"
          strokeDasharray={`${progress} ${circumference}`}
        />
      </svg>
      <div className="relative z-10 text-center">
        <div className="font-serif text-7xl font-bold leading-none text-gold">{displayScore}</div>
        <div className="mt-1 text-sm text-ink-muted">out of 100</div>
      </div>
      {stampVisible && (
        <div className="stamp-in absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-plum-raised bg-gold text-plum">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

function ProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "1";
  const consumer = CONSUMERS.find((c) => c.id === id) ?? CONSUMERS[0];
  // Always recomputed from the current reviews — not the static consumer.score
  // snapshot — so disputing a review (which suspends its tags) is reflected
  // immediately, without the ring and the breakdown ever disagreeing.
  const liveScore = deriveScore(consumer.reviews);
  const liveTier = getTierFromScore(liveScore);
  const cfg = TIER_CONFIG[liveTier];
  const breakdown = POINTS_BREAKDOWN[consumer.id] ?? { earned: consumer.points, spent: 0 };
  const tierProgress = getTierProgress(liveScore, liveTier);
  const nextCfg = tierProgress.nextTier ? TIER_CONFIG[tierProgress.nextTier] : null;

  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "positive" | "concerns">("all");
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [disputeOpenId, setDisputeOpenId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [disputedReviews, setDisputedReviews] = useState<Record<string, string>>({});
  const [points, setPoints] = useState(consumer.points);
  const [frozenReviewIds, setFrozenReviewIds] = useState<string[]>([]);
  const [newReviewBanner, setNewReviewBanner] = useState<{ businessName: string; reviewId: string } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareLinkActive, setShareLinkActive] = useState(false);
  const shareCanvasRef = useRef<HTMLCanvasElement>(null);

  const cleanStreak = getCleanStreak(
    consumer.reviews.map((r) => ({
      ...r,
      protectedByFreeze: r.protectedByFreeze || frozenReviewIds.includes(r.id),
    }))
  );

  useEffect(() => {
    setShareLinkActive(isShareLinkActive(consumer.id));
  }, [consumer.id]);

  useEffect(() => {
    setPoints(consumer.points);
    setFrozenReviewIds([]);
  }, [consumer.id, consumer.points]);

  useEffect(() => {
    const latest = consumer.reviews[0];
    if (!latest) { setNewReviewBanner(null); return; }
    const key = `repflip:lastSeenReview:${consumer.id}`;
    const lastSeen = window.localStorage.getItem(key);
    setNewReviewBanner(lastSeen !== latest.id ? { businessName: latest.businessName, reviewId: latest.id } : null);
  }, [consumer.id, consumer.reviews]);

  const dismissNewReviewBanner = () => {
    const latest = consumer.reviews[0];
    if (latest) window.localStorage.setItem(`repflip:lastSeenReview:${consumer.id}`, latest.id);
    setNewReviewBanner(null);
  };

  const scrollToLatestReview = () => {
    const latest = consumer.reviews[0];
    setActiveTab("all");
    dismissNewReviewBanner();
    setTimeout(() => {
      document.getElementById(`review-${latest?.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const handleClaim = () => {
    setClaiming(true);
    setTimeout(() => { setClaiming(false); setClaimed(true); }, 1000);
  };

  const openDispute = (reviewId: string) => {
    setDisputeOpenId(reviewId);
    setDisputeReason("");
  };

  const cancelDispute = () => {
    setDisputeOpenId(null);
    setDisputeReason("");
  };

  const submitDispute = (reviewId: string) => {
    if (!disputeReason.trim()) return;
    setDisputeSubmitting(true);
    setTimeout(() => {
      // Mutates the shared review object directly (same convention as
      // awardReviewPoints mutating consumer.points) so getScoreBreakdown /
      // deriveScore — both pure functions over consumer.reviews — pick up
      // the suspension on the very next render, wherever they're called.
      const review = consumer.reviews.find((r) => r.id === reviewId);
      if (review) review.disputeStatus = "disputed";
      setDisputedReviews((prev) => ({ ...prev, [reviewId]: disputeReason.trim() }));
      setDisputeSubmitting(false);
      setDisputeOpenId(null);
      setDisputeReason("");
    }, 800);
  };

  const handleFreezeReview = (reviewId: string) => {
    if (frozenReviewIds.includes(reviewId) || points < FREEZE_COST) return;
    setPoints((p) => p - FREEZE_COST);
    setFrozenReviewIds((prev) => [...prev, reviewId]);
  };

  const handleDownloadShareCard = async () => {
    const canvas = shareCanvasRef.current;
    if (!canvas) return;
    await drawScoreCard(canvas, { name: consumer.name, tier: liveTier, score: liveScore, streak: cleanStreak });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `repflip-score-${consumer.name.split(" ")[0].toLowerCase()}.png`;
    a.click();
  };

  const handleCopyShareLink = async () => {
    const link = `${window.location.origin}/share/${consumer.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Clipboard access denied — button label simply won't confirm.
    }
  };

  const handleCreateShareLink = () => {
    createShareLink(consumer.id);
    setShareLinkActive(true);
  };

  const handleRevokeShareLink = () => {
    revokeShareLink(consumer.id);
    setShareLinkActive(false);
    setShareOpen(false);
  };

  const negativeSet = new Set(NEGATIVE_TAGS);

  const avgRating =
    consumer.reviews.length > 0
      ? consumer.reviews.reduce((a, r) => a + r.rating, 0) / consumer.reviews.length
      : 0;

  const yearReviews = consumer.reviews.filter((r) => r.date.includes("2026"));
  const dollarValue = `$${(points / 100).toFixed(2)}`;

  const filteredReviews =
    activeTab === "positive"
      ? consumer.reviews.filter((r) => r.tags.some((t) => !negativeSet.has(t)))
      : activeTab === "concerns"
      ? consumer.reviews.filter((r) => r.tags.some((t) => negativeSet.has(t)))
      : consumer.reviews;

  return (
    <div className="min-h-screen bg-plum">
      <div className="mx-auto max-w-5xl px-6 pb-16 pt-28">
        {/* Consumer Selector */}
        <div className="mb-6 flex flex-wrap gap-x-5 gap-y-2">
          {CONSUMERS.map((c) => (
            <Link
              key={c.id}
              href={`/profile?id=${c.id}`}
              className={`border-b text-sm font-medium transition-colors ${
                c.id === id ? "border-gold text-ink" : "border-transparent text-ink-muted hover:text-ink"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* ── Left: Score Card ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 border border-hairline bg-plum-raised p-6">
              {/* Avatar + Name */}
              <div className="mb-5 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center border border-hairline bg-plum-sunken font-serif text-2xl font-semibold text-ink">
                  {consumer.name.charAt(0)}
                </div>
                <h1 className="font-serif text-xl font-semibold text-ink">{consumer.name}</h1>
                <p className="mt-0.5 text-sm text-ink-muted">{consumer.city}</p>
                <p className="mt-0.5 text-xs text-ink-muted">Profile created {consumer.memberSince}</p>
                <div className="mt-3 flex flex-col gap-1 text-left text-xs text-ink-muted">
                  <span>{consumer.phone}</span>
                  <span className="break-all">{consumer.email}</span>
                </div>
              </div>

              {/* Points Balance */}
              <div className="mb-5 border-t border-hairline pt-4 text-center">
                <p className="mb-0.5 text-sm text-ink-muted">Points balance</p>
                <div className="flex items-baseline justify-center gap-2 flex-wrap">
                  <span className="font-serif text-4xl font-bold leading-none text-gold">{points.toLocaleString()}</span>
                  <span className="text-base font-medium text-ink-muted">pts</span>
                </div>
                <p className="mt-1 text-sm font-medium text-ink-muted">{dollarValue}</p>
                <div className="mt-2.5 h-1 w-full bg-hairline">
                  <div className="h-full bg-gold transition-all" style={{ width: `${Math.min((points / 5000) * 100, 100)}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-ink-muted">100 pts = $1.00. Points never expire.</p>
              </div>

              {/* Score Ring */}
              <div className="mb-5 flex justify-center border-y border-hairline py-6">
                <ScoreCircle score={liveScore} revealKey={consumer.id} />
              </div>

              {/* Score Breakdown — right under the score itself, real visual weight */}
              <div className="mb-5">
                <ScoreBreakdown reviews={consumer.reviews} />
              </div>

              {/* Tier label */}
              <p className="mb-4 text-center font-serif text-lg font-semibold" style={{ color: cfg.color }}>
                {liveTier} member
              </p>

              {/* Share Score CTA */}
              <button
                onClick={() => setShareOpen(true)}
                className="mb-4 w-full rounded bg-gold py-2.5 text-sm font-semibold text-plum transition-colors hover:bg-gold-deep"
              >
                Share your score
              </button>

              {/* Tier Progress */}
              <div className="mb-4 border border-hairline p-3">
                {tierProgress.nextTier ? (
                  <>
                    <p className="mb-2 text-xs leading-relaxed text-ink-muted">
                      You need{" "}
                      <span className="font-semibold" style={{ color: nextCfg?.color }}>
                        {tierProgress.pointsToNext} more points
                      </span>{" "}
                      to reach{" "}
                      <span className="font-semibold" style={{ color: nextCfg?.color }}>
                        {tierProgress.nextTier}
                      </span>{" "}
                      tier.
                    </p>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="font-semibold" style={{ color: cfg.color }}>{liveTier}</span>
                      <span className="font-semibold" style={{ color: nextCfg?.color }}>{tierProgress.nextTier}</span>
                    </div>
                    <div className="h-1 w-full bg-hairline">
                      <div className="h-full bg-gold transition-all" style={{ width: `${Math.min(tierProgress.pct, 100)}%` }} />
                    </div>
                    <p className="mt-1.5 text-right text-xs font-semibold text-gold">
                      {Math.round(tierProgress.pct)}% there
                    </p>
                  </>
                ) : (
                  <div className="text-center py-1">
                    <p className="text-sm font-semibold" style={{ color: cfg.color }}>Max tier reached.</p>
                    <p className="mt-0.5 text-xs text-ink-muted">You&apos;re at the top. Keep it up.</p>
                  </div>
                )}
              </div>

              {/* Clean Streak */}
              <div className="mb-4 border border-hairline">
                <div className="flex items-center justify-between px-3 py-2.5 text-sm">
                  <span className="text-ink-muted">Clean streak</span>
                  <span className="font-semibold text-ink">
                    {cleanStreak} review{cleanStreak === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="px-3 pb-2.5 text-xs text-ink-muted">
                  {cleanStreak === 0
                    ? "No active streak yet — your next great review starts one."
                    : "Consecutive positive reviews, no red flags."}
                </p>
                {frozenReviewIds.length === 0 ? (
                  <p className="border-t border-hairline px-3 py-2.5 text-xs text-ink-muted">
                    Disputing a review you believe is wrong? You can protect your streak from it
                    while the dispute is pending — see Review history below.
                  </p>
                ) : (
                  <p className="border-t border-hairline px-3 py-2.5 text-xs text-sage">
                    {frozenReviewIds.length} review{frozenReviewIds.length === 1 ? "" : "s"} under
                    dispute {frozenReviewIds.length === 1 ? "is" : "are"} currently protected from
                    breaking this streak.
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="mb-4 border border-hairline">
                <div className="flex items-center justify-between border-b border-hairline px-3 py-2.5 text-sm">
                  <span className="text-ink-muted">Reviews</span>
                  <span className="font-semibold text-ink">{consumer.reviews.length}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2.5 text-sm">
                  <span className="text-ink-muted">Average rating</span>
                  <span className="font-semibold text-ink">{consumer.reviews.length > 0 ? avgRating.toFixed(1) : "—"}</span>
                </div>
              </div>

              {/* Claim Button */}
              {claimed ? (
                <div className="w-full border border-sage py-3 text-center">
                  <p className="text-sm font-semibold text-sage">Profile claimed</p>
                  <p className="mt-0.5 text-xs text-ink-muted">Verification pending</p>
                </div>
              ) : (
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full rounded border border-hairline py-3 text-sm font-semibold text-ink transition-colors hover:border-gold hover:text-gold disabled:opacity-60"
                >
                  {claiming ? "Verifying…" : "Claim this profile"}
                </button>
              )}
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* New Review Notification */}
            {newReviewBanner && (
              <div className="border-l-2 border-gold bg-plum-raised p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-serif text-base font-semibold text-ink">New review just in</p>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      You just got a new review from{" "}
                      <span className="font-semibold text-gold">{newReviewBanner.businessName}</span> — see how
                      it moved your score.
                    </p>
                    <button
                      onClick={scrollToLatestReview}
                      className="mt-3 rounded bg-gold px-4 py-1.5 text-xs font-semibold text-plum transition-colors hover:bg-gold-deep"
                    >
                      View review →
                    </button>
                  </div>
                  <button
                    onClick={dismissNewReviewBanner}
                    className="shrink-0 text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Welcome Banner (dismissible) */}
            {!bannerDismissed && (
              <div className="border border-hairline bg-plum-raised p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-serif text-base font-semibold text-ink">Welcome to your Repflip profile</span>
                  <button
                    onClick={() => setBannerDismissed(true)}
                    className="text-sm text-ink-muted transition-colors hover:text-ink"
                  >
                    Dismiss
                  </button>
                </div>
                <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
                  {[
                    { step: "1", title: "Your score", desc: "0–100 reputation score built from every review you receive." },
                    { step: "2", title: "Earn points", desc: "Every positive review earns points. 100 pts = $1 real value." },
                    { step: "3", title: "Redeem rewards", desc: "Spend points on gift cards, discounts, and monthly cash draws." },
                  ].map((s) => (
                    <div key={s.step} className="bg-plum-raised p-3">
                      <div className="mb-0.5 text-sm font-semibold text-ink">Step {s.step} — {s.title}</div>
                      <div className="text-xs leading-relaxed text-ink-muted">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Your Year So Far */}
            <div className="border border-hairline bg-plum-raised">
              <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
                <h2 className="font-serif text-base font-semibold text-ink">Your year so far</h2>
                <span className="border border-hairline px-2 py-0.5 text-xs text-ink-muted">2026</span>
              </div>
              <div className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-4">
                {[
                  { value: String(yearReviews.length), label: "Reviews received", sub: `of ${consumer.reviews.length} total` },
                  { value: breakdown.earned.toLocaleString(), label: "Points earned", sub: "lifetime total" },
                  { value: dollarValue, label: "Balance value", sub: `${points.toLocaleString()} pts` },
                  { value: liveTier, label: "Current tier", sub: `score ${liveScore}/100`, style: { color: cfg.color } },
                ].map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center justify-center gap-0.5 bg-plum-raised p-4 text-center">
                    <div className="font-serif text-2xl font-bold leading-none text-ink" style={stat.style}>
                      {stat.value}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-ink">{stat.label}</div>
                    <div className="text-xs text-ink-muted">{stat.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review History */}
            <div className="border border-hairline bg-plum-raised p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-ink">Review history</h2>
                <span className="text-xs text-ink-muted">
                  {consumer.reviews.length} review{consumer.reviews.length === 1 ? "" : "s"}
                </span>
              </div>

              {/* Tabs */}
              <div className="mb-5 flex gap-5 border-b border-hairline">
                {(["all", "positive", "concerns"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`border-b-2 pb-2 text-sm font-semibold capitalize transition-colors ${
                      activeTab === tab ? "border-gold text-ink" : "border-transparent text-ink-muted hover:text-ink"
                    }`}
                  >
                    {tab === "all" ? `All (${consumer.reviews.length})` : tab === "positive" ? "Positive" : "Concerns"}
                  </button>
                ))}
              </div>

              {filteredReviews.length === 0 ? (
                <div className="py-10 text-center text-sm text-ink-muted">No reviews in this category</div>
              ) : (
                <div className="flex flex-col divide-y divide-hairline">
                  {filteredReviews.map((review) => (
                    <div key={review.id} id={`review-${review.id}`} className="scroll-mt-28 py-4 first:pt-0">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-serif font-semibold text-ink">{review.businessType}</h3>
                          <p className="text-xs text-ink-muted">Verified review — anonymous</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <StarDisplay rating={review.rating} />
                          <p className="mt-1 text-xs text-ink-muted">{review.date}</p>
                        </div>
                      </div>
                      {review.notes && (
                        <p className="mb-3 border-l-2 border-hairline pl-3 text-sm leading-relaxed text-ink-muted">
                          &ldquo;{review.notes}&rdquo;
                        </p>
                      )}
                      <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1">
                        {review.tags.map((tag) => {
                          const isNeg = negativeSet.has(tag);
                          return (
                            <span key={tag} className={`border-l-2 pl-1.5 text-xs font-medium ${isNeg ? "border-rust text-rust" : "border-sage text-sage"}`}>
                              {tag}
                            </span>
                          );
                        })}
                      </div>

                      {/* Dispute this review */}
                      {review.disputeStatus === "resolved_favorably" ? (
                        <div className="border border-sage bg-plum px-3 py-2 text-xs text-sage">
                          <span className="font-semibold">Dispute resolved in your favor.</span> This review
                          stays visible above exactly as submitted, but its tags are permanently excluded
                          from your score — as if it never happened.
                        </div>
                      ) : review.disputeStatus === "resolved_unfavorably" ? (
                        <div className="border border-hairline bg-plum px-3 py-2 text-xs text-ink-muted">
                          <span className="font-semibold text-ink">Dispute reviewed — original rating upheld.</span>{" "}
                          Repflip reviewed this dispute and found the original review accurate. Its tags count
                          toward your score at full weight, same as any other review — nothing is hidden or
                          discounted because it was disputed.
                        </div>
                      ) : disputedReviews[review.id] || review.disputeStatus === "disputed" ? (
                        <div className="border border-rust bg-plum px-3 py-2 text-xs text-rust">
                          <span className="font-semibold">Dispute submitted — pending.</span> Repflip will
                          review this within 3–5 business days. While pending, this review&apos;s tags don&apos;t
                          count toward your score — see the score breakdown above.
                        </div>
                      ) : disputeOpenId === review.id ? (
                        <div className="border border-hairline bg-plum p-3">
                          <label className="mb-1.5 block text-xs font-medium text-ink-muted">
                            Why is this review inaccurate?
                          </label>
                          <textarea
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            rows={3}
                            autoFocus
                            placeholder="Describe what's wrong with this review — we'll ask the business to respond."
                            className="w-full resize-none border border-hairline bg-plum-sunken p-2.5 text-sm text-ink placeholder-ink-muted outline-none transition-colors focus:border-gold"
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => submitDispute(review.id)}
                              disabled={!disputeReason.trim() || disputeSubmitting}
                              className="rounded bg-gold px-4 py-1.5 text-xs font-semibold text-plum transition-colors hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {disputeSubmitting ? "Submitting…" : "Submit dispute"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelDispute}
                              disabled={disputeSubmitting}
                              className="rounded border border-hairline px-4 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openDispute(review.id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-rust"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                          </svg>
                          Dispute this review
                        </button>
                      )}

                      {/* Streak freeze — only offered once a review is under dispute, and only if it would otherwise break the streak */}
                      {(disputedReviews[review.id] || review.disputeStatus === "disputed") && review.tags.some((t) => negativeSet.has(t)) && (
                        frozenReviewIds.includes(review.id) ? (
                          <div className="mt-2 border border-sage bg-plum px-3 py-2 text-xs text-sage">
                            <span className="font-semibold">Streak protected while disputed</span> — {FREEZE_COST} pts spent.
                            This review is still visible above, unchanged — freezing only shields your
                            streak counter, it does not hide, remove, or alter the review itself.
                          </div>
                        ) : (
                          <div className="mt-2 border border-hairline bg-plum p-3">
                            <p className="mb-2 text-xs leading-relaxed text-ink-muted">
                              This review is under dispute. For {FREEZE_COST} pts you can protect your
                              streak from it while the dispute is pending. This does{" "}
                              <span className="font-semibold text-ink">not</span> hide, remove, or change
                              the review — it stays visible above exactly as submitted; only your streak
                              counter is shielded until the dispute is resolved.
                            </p>
                            <button
                              type="button"
                              onClick={() => handleFreezeReview(review.id)}
                              disabled={points < FREEZE_COST}
                              className="w-full rounded bg-gold px-3 py-1.5 text-xs font-semibold text-plum transition-colors hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              Protect streak while disputed — {FREEZE_COST} pts
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* How Your Data Is Protected */}
            <div className="border border-hairline bg-plum-raised p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold text-ink">How your data is protected</h2>
              <div className="flex flex-col divide-y divide-hairline">
                <div className="py-3 first:pt-0">
                  <div className="text-sm font-semibold text-ink">Private by default, shareable only if you choose to</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-ink-muted">Your Repflip score is never shown publicly or to anyone outside of participating businesses — unless you explicitly create a shareable link yourself. Links you create expire after {SHARE_LINK_EXPIRY_DAYS} days and can be revoked anytime.</div>
                </div>
                <div className="py-3">
                  <div className="text-sm font-semibold text-ink">Only verified businesses can view your score</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-ink-muted">Only verified, paying businesses on the Repflip platform can look up your score, and only when they have an active booking relationship.</div>
                </div>
                <div className="py-3">
                  <div className="text-sm font-semibold text-ink">Business names are never revealed</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-ink-muted">You will never know which specific company reviewed you — only the business category (e.g. &quot;Personal Training&quot;) is shown. Reviews are always anonymous.</div>
                </div>
              </div>
            </div>

            {/* Points Breakdown */}
            <div className="border border-hairline bg-plum-raised p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold text-ink">Points breakdown</h2>
              <div className="flex flex-col divide-y divide-hairline">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-ink-muted">Total earned</span>
                  <span className="text-sm font-semibold text-sage">{breakdown.earned.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-ink-muted">Total spent</span>
                  <span className="text-sm font-semibold text-rust">{breakdown.spent.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-ink-muted">Balance</span>
                  <span className="text-sm font-semibold text-ink">{points.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-sm text-ink-muted">Dollar value</span>
                  <span className="text-sm font-semibold text-gold">${(points / 100).toFixed(2)}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-ink-muted">100 points = $1.00. Points never expire.</p>
            </div>

            {/* How to Improve */}
            <div className="border border-hairline bg-plum-raised p-6">
              <h2 className="mb-4 font-serif text-lg font-semibold text-ink">How to improve your score</h2>
              <div className="flex flex-col divide-y divide-hairline">
                {TIPS.map((tip) => (
                  <div key={tip.title} className="py-3 first:pt-0">
                    <div className="text-sm font-semibold text-ink">{tip.title}</div>
                    <div className="mt-0.5 text-xs leading-relaxed text-ink-muted">{tip.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rewards CTA */}
            <div className="border border-hairline bg-plum-raised p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {points.toLocaleString()} points <span className="text-gold">(${(points / 100).toFixed(2)})</span>
                  </p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Redeem for discounts, gift cards, and monthly prize draws.
                    {liveTier !== "Platinum" && " Keep earning to reach the next tier."}
                  </p>
                </div>
                <Link
                  href="/rewards"
                  className="shrink-0 rounded border border-hairline px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-gold hover:text-gold"
                >
                  View rewards
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Score Modal */}
      {shareOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#221727]/90 p-6"
          onClick={() => setShareOpen(false)}
        >
          <div className="relative w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShareOpen(false)}
              className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center border border-hairline bg-plum text-ink transition-colors hover:border-gold hover:text-gold"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {shareLinkActive ? (
              <>
                <ShareCard name={consumer.name} tier={liveTier} score={liveScore} streak={cleanStreak} />
                <canvas ref={shareCanvasRef} className="hidden" />
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleDownloadShareCard}
                    className="flex-1 rounded bg-gold py-3 text-sm font-semibold text-plum transition-colors hover:bg-gold-deep"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={handleCopyShareLink}
                    className="flex-1 rounded border border-hairline py-3 text-sm font-semibold text-ink transition-colors hover:border-gold hover:text-gold"
                  >
                    {linkCopied ? "Copied" : "Copy link"}
                  </button>
                </div>
                <div className="mt-3 border border-hairline bg-plum-raised p-3">
                  <p className="mb-2 text-xs leading-relaxed text-ink-muted">
                    This link is public — anyone who has it can view this score card, no login
                    required. It expires in {SHARE_LINK_EXPIRY_DAYS} days.
                  </p>
                  <button
                    onClick={handleRevokeShareLink}
                    className="w-full rounded border border-rust py-2 text-xs font-semibold text-rust transition-colors hover:bg-rust hover:text-plum"
                  >
                    Revoke this link
                  </button>
                </div>
              </>
            ) : (
              <div className="border border-hairline bg-plum-raised p-6">
                <h3 className="mb-2 font-serif text-lg font-semibold text-ink">Create a shareable link?</h3>
                <p className="mb-5 text-sm leading-relaxed text-ink-muted">
                  This creates a <span className="text-ink">public</span> link — anyone with the
                  URL can view {consumer.name.split(" ")[0]}&apos;s score card, no login required.
                  Your score stays private otherwise, shown only to verified businesses. The link
                  expires after {SHARE_LINK_EXPIRY_DAYS} days, and you can revoke it anytime.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateShareLink}
                    className="flex-1 rounded bg-gold py-2.5 text-sm font-semibold text-plum transition-colors hover:bg-gold-deep"
                  >
                    Create shareable link
                  </button>
                  <button
                    onClick={() => setShareOpen(false)}
                    className="flex-1 rounded border border-hairline py-2.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-plum">
          <div className="text-ink-muted">Loading profile…</div>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
