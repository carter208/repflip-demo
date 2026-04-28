"use client";

import { useState } from "react";
import Link from "next/link";
import { BEHAVIORAL_TAGS, CONSUMERS } from "@/lib/data";

export default function SubmitReviewPage() {
  const [consumerId, setConsumerId] = useState("1");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const consumer = CONSUMERS.find((c) => c.id === consumerId);

  const toggleTag = (id: string) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const STAR_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  const positiveTags = BEHAVIORAL_TAGS.filter((t) => t.positive);
  const negativeTags = BEHAVIORAL_TAGS.filter((t) => !t.positive);

  if (submitted && consumer) {
    return (
      <div className="min-h-screen bg-[#020810]">
        <div className="flex min-h-screen items-center justify-center px-6 pt-16">
          <div className="glass-card w-full max-w-md overflow-hidden rounded-3xl p-10 text-center shadow-2xl">
            <div className="mb-4 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-950/50 border border-emerald-700/40 text-4xl">
                ✓
              </div>
            </div>
            <h2 className="mb-2 text-2xl font-black text-white">Review Submitted</h2>
            <p className="mb-1 text-slate-400">
              Your review of <span className="font-semibold text-white">{consumer.name}</span> has been recorded.
            </p>
            <p className="mb-8 text-sm text-slate-500">
              It will be reflected in their Repflip score within 24 hours.
            </p>

            <div className="mb-8 rounded-2xl border border-blue-900/40 bg-blue-950/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">Rating submitted</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className={`h-4 w-4 ${i <= rating ? "star-filled" : "star-empty"}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map((id) => {
                    const tag = BEHAVIORAL_TAGS.find((t) => t.id === id)!;
                    return (
                      <span key={id} className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${tag.positive ? "bg-emerald-950/50 text-emerald-400 border-emerald-800/40" : "bg-red-950/50 text-red-400 border-red-800/40"}`}>
                        {tag.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-500"
              >
                Back to Dashboard
              </Link>
              <button
                onClick={() => { setSubmitted(false); setRating(0); setSelectedTags([]); setNotes(""); }}
                className="w-full rounded-xl border border-blue-800/40 bg-blue-950/30 px-6 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Submit Another Review
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020810]">
      <div className="mx-auto max-w-2xl px-6 pb-16 pt-28">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Link href="/dashboard" className="text-xs font-semibold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">
              ← Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-black text-white md:text-5xl">Submit Review</h1>
          <p className="mt-2 text-slate-400">Your feedback shapes the trust economy for every service business.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Consumer Select */}
          <div className="glass-card rounded-2xl p-5">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-slate-400">
              Consumer
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CONSUMERS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setConsumerId(c.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    consumerId === c.id
                      ? "border-blue-600/50 bg-blue-600/15"
                      : "border-blue-900/30 bg-blue-950/20 hover:border-blue-800/40"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-800/30 text-sm font-bold text-blue-300">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.phone}</p>
                  </div>
                  {consumerId === c.id && (
                    <div className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Star Rating */}
          <div className="glass-card rounded-2xl p-5">
            <label className="mb-4 block text-xs font-semibold uppercase tracking-widest text-slate-400">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <svg
                      className={`h-10 w-10 transition-colors ${star <= (hovered || rating) ? "text-yellow-400" : "text-blue-950"}`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      style={star <= (hovered || rating) ? { filter: "drop-shadow(0 0 8px rgba(245,158,11,0.4))" } : {}}
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
              <div className="h-6">
                {(hovered || rating) > 0 && (
                  <span className="text-base font-semibold text-yellow-400">
                    {STAR_LABELS[hovered || rating]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Behavioral Tags */}
          <div className="glass-card rounded-2xl p-5">
            <label className="mb-4 block text-xs font-semibold uppercase tracking-widest text-slate-400">
              Behavioral Tags
            </label>

            <div className="mb-3">
              <p className="mb-2 text-xs font-medium text-emerald-400 uppercase tracking-wide">Positive</p>
              <div className="flex flex-wrap gap-2">
                {positiveTags.map((tag) => {
                  const active = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                        active
                          ? "border-emerald-600/60 bg-emerald-900/40 text-emerald-300"
                          : "border-blue-900/40 bg-blue-950/20 text-slate-400 hover:border-emerald-800/40 hover:text-emerald-400"
                      }`}
                    >
                      {active ? "✓ " : ""}{tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-red-400 uppercase tracking-wide">Concerns</p>
              <div className="flex flex-wrap gap-2">
                {negativeTags.map((tag) => {
                  const active = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
                        active
                          ? "border-red-600/60 bg-red-900/40 text-red-300"
                          : "border-blue-900/40 bg-blue-950/20 text-slate-400 hover:border-red-800/40 hover:text-red-400"
                      }`}
                    >
                      {active ? "✕ " : ""}{tag.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="glass-card rounded-2xl p-5">
            <label className="mb-3 block text-xs font-semibold uppercase tracking-widest text-slate-400">
              Notes <span className="text-slate-600 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the interaction — what went well or what didn't. Other businesses rely on your honesty."
              rows={4}
              className="w-full resize-none rounded-xl border border-blue-800/40 bg-blue-950/40 p-4 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-blue-500/60 focus:ring-2 focus:ring-blue-600/20 leading-relaxed"
            />
            <div className="mt-2 flex justify-between">
              <p className="text-xs text-slate-600">Be honest and factual. Reviews are verified against booking data.</p>
              <span className="text-xs text-slate-600">{notes.length}/500</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={rating === 0 || submitting}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/30 transition-all hover:bg-blue-500 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting…
              </>
            ) : (
              "Submit Review"
            )}
          </button>

          {rating === 0 && (
            <p className="text-center text-xs text-slate-600">Select a star rating to submit</p>
          )}
        </form>
      </div>
    </div>
  );
}
