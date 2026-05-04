"use client";

import { useState } from "react";
import Link from "next/link";
import { CONSUMERS, TIER_CONFIG, type Consumer } from "@/lib/data";
// TIER_CONFIG used for header glow and tier badge styling

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

const LIGHTS = [
  { id: "red" as Signal,    on: "#ef4444", glow: "rgba(239,68,68,0.5)",    dim: "rgba(239,68,68,0.07)"    },
  { id: "yellow" as Signal, on: "#f59e0b", glow: "rgba(245,158,11,0.5)",   dim: "rgba(245,158,11,0.07)"   },
  { id: "green" as Signal,  on: "#22c55e", glow: "rgba(34,197,94,0.5)",    dim: "rgba(34,197,94,0.07)"    },
];

const SIGNAL_TEXT: Record<Signal, { headline: string; subline: string; cls: string }> = {
  green:  { headline: "Green Light — Trusted Customer.",        subline: "Take the job.",               cls: "text-emerald-400" },
  yellow: { headline: "Yellow Light — Proceed with Caution.",   subline: "Review the details.",         cls: "text-yellow-400"  },
  red:    { headline: "Red Light — High Risk.",                  subline: "Charge more or decline.",     cls: "text-red-400"     },
  grey:   { headline: "No Reviews Yet",                          subline: "You would be their first.",   cls: "text-slate-400"   },
};

function getSignal(score: number, hasReviews: boolean): Signal {
  if (!hasReviews) return "grey";
  if (score >= 85) return "green";
  if (score >= 65) return "yellow";
  return "red";
}

function TrafficLight({ score, hasReviews }: { score: number; hasReviews: boolean }) {
  const signal = getSignal(score, hasReviews);
  const { headline, subline, cls } = SIGNAL_TEXT[signal];

  const dotColor: Record<Signal, string> = {
    green:  "#22c55e",
    yellow: "#f59e0b",
    red:    "#ef4444",
    grey:   "#64748b",
  };
  const dotGlow: Record<Signal, string> = {
    green:  "rgba(34,197,94,0.55)",
    yellow: "rgba(245,158,11,0.55)",
    red:    "rgba(239,68,68,0.55)",
    grey:   "rgba(100,116,139,0.3)",
  };

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <div
        className="h-24 w-24 rounded-full flex-shrink-0"
        style={{
          backgroundColor: dotColor[signal],
          boxShadow: `0 0 32px ${dotGlow[signal]}, 0 0 64px ${dotGlow[signal]}`,
        }}
      />
      <div className="text-center max-w-[200px]">
        <p className={`text-base font-black leading-snug ${cls}`}>{headline}</p>
        <p className="text-sm text-slate-400 mt-1">{subline}</p>
        {hasReviews && (
          <p className="mt-2 text-xs text-slate-600">
            Score: <span className="font-semibold text-slate-400">{score} / 100</span>
          </p>
        )}
      </div>
    </div>
  );
}

function ConsumerCard({ consumer, onSubmitReview }: { consumer: Consumer; onSubmitReview: () => void }) {
  const cfg = TIER_CONFIG[consumer.tier];
  const hasReviews = consumer.reviews.length > 0;
  const positiveTags = consumer.reviews
    .flatMap((r) => r.tags)
    .filter((t) => !["No-show", "Disputed payment", "Aggressive", "Scope creep"].includes(t));
  const negativeTags = consumer.reviews
    .flatMap((r) => r.tags)
    .filter((t) => ["No-show", "Disputed payment", "Aggressive", "Scope creep"].includes(t));
  const uniquePos = Array.from(new Set(positiveTags));
  const uniqueNeg = Array.from(new Set(negativeTags));

  return (
    <div className="glass-card overflow-hidden rounded-2xl shadow-card-glow">
      {/* Traffic Light Hero */}
      <div className="relative overflow-hidden border-b border-blue-900/30 px-6 py-8 text-center">
        <div
          className="absolute inset-0 opacity-10 blur-3xl"
          style={{
            background: `radial-gradient(circle at 50% 60%, ${
              !hasReviews ? "#64748b" : consumer.score >= 85 ? "#22c55e" : consumer.score >= 65 ? "#f59e0b" : "#ef4444"
            }, transparent 70%)`,
          }}
        />
        <div className="relative">
          <TrafficLight score={consumer.score} hasReviews={hasReviews} />
        </div>
      </div>

      {/* Consumer Info */}
      <div className="relative overflow-hidden p-6 pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black text-white"
              style={{ background: `linear-gradient(135deg, ${cfg.color}30, ${cfg.color}10)`, border: `1px solid ${cfg.color}30` }}
            >
              {consumer.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{consumer.name}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-slate-400">{consumer.phone}</span>
                <span className="text-slate-700">·</span>
                <span className="text-sm text-slate-400">{consumer.email}</span>
              </div>
            </div>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${cfg.bg} ${cfg.border} ${cfg.text}`}
          >
            {consumer.tier}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-1 flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-blue-900/40 bg-blue-950/30 p-3 text-center">
              <div className="text-2xl font-black text-white">{consumer.reviews.length}</div>
              <div className="text-xs text-slate-500 mt-0.5">Reviews</div>
            </div>
            <div className="rounded-xl border border-blue-900/40 bg-blue-950/30 p-3 text-center">
              <div className="text-2xl font-black text-white">
                {consumer.reviews.length > 0
                  ? (consumer.reviews.reduce((a, r) => a + r.rating, 0) / consumer.reviews.length).toFixed(1)
                  : "—"}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Avg Rating</div>
            </div>
            <div className="rounded-xl border border-blue-900/40 bg-blue-950/30 p-3 text-center">
              <div className="text-xl font-black" style={{ color: cfg.color }}>{consumer.points.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-0.5">Points</div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">Behavioral Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {uniquePos.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                  ✓ {tag}
                </span>
              ))}
              {uniqueNeg.map((tag) => (
                <span key={tag} className="rounded-full bg-red-950/50 border border-red-800/40 px-2.5 py-0.5 text-xs font-medium text-red-400">
                  ✕ {tag}
                </span>
              ))}
              {uniquePos.length === 0 && uniqueNeg.length === 0 && (
                <span className="text-xs text-slate-600">No tags yet</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review History */}
      <div className="border-t border-blue-900/30 px-6 pb-6 pt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Review History</p>
        <div className="flex flex-col gap-2">
          {consumer.reviews.map((review) => (
            <div key={review.id} className="flex items-start gap-3 rounded-xl border border-blue-900/30 bg-blue-950/20 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white truncate">{review.businessType}</span>
                  <span className="text-xs text-slate-600 shrink-0">{review.date}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <StarRow rating={review.rating} />
                  <span className="text-xs text-slate-500">Verified review</span>
                </div>
                {review.notes && (
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-400 line-clamp-2">{review.notes}</p>
                )}
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {review.tags.map((tag) => {
                    const isNeg = ["No-show", "Disputed payment", "Aggressive", "Scope creep"].includes(tag);
                    return (
                      <span key={tag} className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${isNeg ? "bg-red-950/40 text-red-400 border-red-800/30" : "bg-emerald-950/40 text-emerald-400 border-emerald-800/30"}`}>
                        {tag}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className="border-t border-blue-900/30 px-6 py-4 flex items-center justify-between gap-4">
        <Link
          href={`/profile?id=${consumer.id}`}
          className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          View Full Profile →
        </Link>
        <button
          onClick={onSubmitReview}
          className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500 hover:scale-[1.02]"
        >
          Submit Review
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-[#020810]">
      <div className="mx-auto max-w-4xl px-6 pt-28 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-blue-600" />
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">Business Dashboard</span>
          </div>
          <h1 className="text-4xl font-black text-white md:text-5xl">Consumer Lookup</h1>
          <p className="mt-2 text-slate-400">Search any consumer before you accept their booking.</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8 flex gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or phone number…"
              className="w-full rounded-xl border border-blue-800/40 bg-blue-950/40 py-3.5 pl-11 pr-4 text-base text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/60 focus:ring-2 focus:ring-blue-600/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
          >
            Search
          </button>
          {searched && (
            <button
              type="button"
              onClick={() => { setQuery(""); setSearched(false); setShowingAll(true); setResults([]); }}
              className="rounded-xl border border-blue-800/40 bg-blue-950/30 px-4 py-3.5 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </form>

        {/* Quick search pills */}
        {!searched && (
          <div className="mb-8 flex flex-wrap gap-2">
            <span className="text-xs text-slate-600 pt-1">Try:</span>
            {CONSUMERS.map((c) => (
              <button
                key={c.id}
                onClick={() => { setQuery(c.name); }}
                className="rounded-full border border-blue-900/40 bg-blue-950/30 px-3 py-1 text-xs text-slate-400 hover:text-white hover:border-blue-700/40 transition-all"
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {searched && results.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="mb-3 text-4xl">🔍</div>
            <h3 className="text-lg font-bold text-white">No results found</h3>
            <p className="mt-1 text-sm text-slate-400">
              No consumer matches &ldquo;{query}&rdquo;. They may not have a Repflip profile yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {searched && (
              <p className="text-sm text-slate-400">
                {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
              </p>
            )}
            {displayed.map((consumer) => (
              <ConsumerCard key={consumer.id} consumer={consumer} onSubmitReview={handleSubmitReview} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
