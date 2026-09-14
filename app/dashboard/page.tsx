"use client";

import { useState } from "react";
import Link from "next/link";
import { CONSUMERS, TIER_CONFIG, getTierProgress, getTierFromScore, deriveScore, isNegativeTag, type Consumer } from "@/lib/data";
import { useScoreReveal } from "@/lib/useScoreReveal";
import ScoreBreakdown from "@/components/ScoreBreakdown";

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`h-3.5 w-3.5 ${i <= rating ? "star-filled" : "star-empty"}`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

type Signal = "green" | "yellow" | "red" | "grey";

const SIGNAL_TEXT: Record<Signal, { headline: string; subline: string; color: string }> = {
  green: { headline: "Green light — trusted customer", subline: "Move forward.", color: "#8fa06a" },
  yellow: { headline: "Yellow light — proceed with caution", subline: "Review the details.", color: "#d4a24e" },
  red: { headline: "Red light — high risk", subline: "Charge more or decline.", color: "#b3564a" },
  grey: { headline: "No reviews yet", subline: "You would be their first.", color: "#b09fb8" },
};

function getSignal(score: number, hasReviews: boolean): Signal {
  if (!hasReviews) return "grey";
  if (score >= 85) return "green";
  if (score >= 65) return "yellow";
  return "red";
}

function TrafficLight({ score, hasReviews, revealKey }: { score: number; hasReviews: boolean; revealKey: string | number }) {
  const signal = getSignal(score, hasReviews);
  const { headline, subline, color } = SIGNAL_TEXT[signal];
  const { displayScore, revealed, stampVisible } = useScoreReveal(score, revealKey, 975);
  const checking = hasReviews && !revealed;

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div
        className={`relative h-20 w-20 flex-shrink-0 rounded-full transition-colors duration-300 ${checking ? "signal-checking" : ""}`}
        style={{ backgroundColor: checking ? "#4a3a52" : color }}
      >
        {!checking && stampVisible && (
          <div className="stamp-in absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-plum bg-gold text-plum">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      <div className="max-w-[220px] text-center">
        {checking ? (
          <>
            <p className="font-serif text-base font-semibold leading-snug text-ink-muted">Checking reputation…</p>
            <p className="mt-1 text-sm text-ink-muted">Pulling review history</p>
          </>
        ) : (
          <>
            <p className="font-serif text-base font-semibold leading-snug text-ink">{headline}</p>
            <p className="mt-1 text-sm text-ink-muted">{subline}</p>
          </>
        )}
        {hasReviews && (
          <p className="mt-2 text-xs text-ink-muted">
            Score: <span className="font-semibold text-ink">{displayScore} / 100</span>
          </p>
        )}
      </div>
    </div>
  );
}

function ConsumerCard({ consumer, onSubmitReview, revealKey }: { consumer: Consumer; onSubmitReview: () => void; revealKey: string | number }) {
  // Live-derived, not the static consumer.score snapshot — reflects any
  // reviews currently excluded from scoring (e.g. a pending dispute).
  const liveScore = deriveScore(consumer.reviews);
  const liveTier = getTierFromScore(liveScore);
  const cfg = TIER_CONFIG[liveTier];
  const hasReviews = consumer.reviews.length > 0;
  const tierProgress = getTierProgress(liveScore, liveTier);
  const nextCfg = tierProgress.nextTier ? TIER_CONFIG[tierProgress.nextTier] : null;

  const stats = [
    { label: "Reviews", value: String(consumer.reviews.length) },
    {
      label: "Average rating",
      value: consumer.reviews.length > 0
        ? (consumer.reviews.reduce((a, r) => a + r.rating, 0) / consumer.reviews.length).toFixed(1)
        : "—",
    },
    { label: "Points", value: consumer.points.toLocaleString() },
  ];

  return (
    <div className="border border-hairline bg-plum-raised">
      {/* Traffic Light Hero */}
      <div className="border-b border-hairline px-6 py-8 text-center">
        <TrafficLight score={liveScore} hasReviews={hasReviews} revealKey={`${consumer.id}-${revealKey}`} />
      </div>

      {/* Score Breakdown — right under the score itself, real visual weight */}
      {hasReviews && (
        <div className="p-6 pb-0">
          <ScoreBreakdown reviews={consumer.reviews} />
        </div>
      )}

      {/* Consumer Info */}
      <div className="p-6 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center border border-hairline bg-plum-sunken font-serif text-xl font-semibold text-ink">
              {consumer.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-serif text-xl font-semibold text-ink">{consumer.name}</h2>
              <div className="mt-0.5 flex flex-col text-sm text-ink-muted">
                <span>{consumer.phone}</span>
                <span>{consumer.email}</span>
              </div>
            </div>
          </div>
          <span className="font-serif text-sm font-semibold" style={{ color: cfg.color }}>
            {liveTier}
          </span>
        </div>

        {/* Tier Progress */}
        <div className="mt-4">
          {tierProgress.nextTier ? (
            <>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold" style={{ color: cfg.color }}>{liveTier}</span>
                <span className="text-ink-muted">
                  {tierProgress.pointsToNext}/100 points to{" "}
                  <span className="font-semibold" style={{ color: nextCfg?.color }}>{tierProgress.nextTier}</span>
                </span>
              </div>
              <div className="h-1 w-full bg-hairline">
                <div className="h-full bg-gold transition-all" style={{ width: `${Math.min(tierProgress.pct, 100)}%` }} />
              </div>
            </>
          ) : (
            <p className="text-center text-xs font-semibold" style={{ color: cfg.color }}>Max tier reached.</p>
          )}
        </div>
      </div>

      {/* Stats — label/value rows */}
      <div className="border-t border-hairline mt-6">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between border-b border-hairline px-6 py-2.5 text-sm">
            <span className="text-ink-muted">{s.label}</span>
            <span className="font-semibold text-ink">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Review History */}
      <div className="border-t border-hairline px-6 py-5">
        <p className="mb-3 text-sm font-medium text-ink-muted">Review history</p>
        <div className="flex flex-col divide-y divide-hairline">
          {consumer.reviews.map((review) => (
            <div key={review.id} className="py-3 first:pt-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">{review.businessType}</span>
                <span className="text-xs text-ink-muted">{review.date}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <StarRow rating={review.rating} />
                <span className="text-xs text-ink-muted">Verified review</span>
              </div>
              {review.notes && (
                <p className="mt-1.5 text-xs leading-relaxed text-ink-muted line-clamp-2">{review.notes}</p>
              )}
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                {review.tags.map((tag) => {
                  const isNeg = isNegativeTag(tag);
                  return (
                    <span key={tag} className={`border-l-2 pl-1.5 text-[11px] font-medium ${isNeg ? "border-rust text-rust" : "border-sage text-sage"}`}>
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4 border-t border-hairline px-6 py-4">
        <Link href={`/profile?id=${consumer.id}`} className="text-sm font-medium text-gold transition-colors hover:text-gold-deep">
          View full profile →
        </Link>
        <button
          onClick={onSubmitReview}
          className="rounded bg-gold px-6 py-2.5 text-sm font-semibold text-plum transition-colors hover:bg-gold-deep"
        >
          Submit review
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<Consumer[]>([]);
  const [showingAll, setShowingAll] = useState(true);
  const [lookupToken, setLookupToken] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupToken((t) => t + 1);
    const q = query.toLowerCase().trim();
    if (!q) {
      setResults(CONSUMERS);
      setShowingAll(true);
      setSearched(false);
      return;
    }
    const found = CONSUMERS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q)
    );
    setResults(found);
    setSearched(true);
    setShowingAll(false);
  };

  const handleSubmitReview = () => {
    window.location.href = "/submit-review";
  };

  const displayed = showingAll ? CONSUMERS : results;

  return (
    <div className="min-h-screen bg-plum">
      <div className="mx-auto max-w-4xl px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-gold">Business dashboard</p>
          <h1 className="font-serif text-4xl font-semibold text-ink md:text-5xl">Consumer lookup</h1>
          <p className="mt-2 text-ink-muted">Search any consumer before you do business with them.</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6 flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or phone number…"
            className="flex-1 border border-hairline bg-plum-raised px-4 py-3.5 text-base text-ink placeholder-ink-muted outline-none transition-colors focus:border-gold"
          />
          <button
            type="submit"
            className="rounded bg-gold px-6 py-3.5 text-sm font-semibold text-plum transition-colors hover:bg-gold-deep"
          >
            Search
          </button>
          {searched && (
            <button
              type="button"
              onClick={() => { setQuery(""); setSearched(false); setShowingAll(true); setResults([]); setLookupToken((t) => t + 1); }}
              className="rounded border border-hairline px-4 py-3.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Clear
            </button>
          )}
        </form>

        {/* Quick search links */}
        {!searched && (
          <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-sm text-ink-muted">Try:</span>
            {CONSUMERS.map((c) => (
              <button
                key={c.id}
                onClick={() => { setQuery(c.name); }}
                className="border-b border-transparent text-sm text-ink-muted transition-colors hover:border-gold hover:text-gold"
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {searched && results.length === 0 ? (
          <div className="border border-hairline bg-plum-raised p-12 text-center">
            <h3 className="font-serif text-lg font-semibold text-ink">No results found</h3>
            <p className="mt-1 text-sm text-ink-muted">
              No consumer matches &ldquo;{query}&rdquo;. They may not have a Repflip profile yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {searched && (
              <p className="text-sm text-ink-muted">
                {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
              </p>
            )}
            {displayed.map((consumer) => (
              <ConsumerCard key={consumer.id} consumer={consumer} onSubmitReview={handleSubmitReview} revealKey={lookupToken} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
