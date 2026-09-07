"use client";

import { useState } from "react";
import Link from "next/link";
import { BEHAVIORAL_TAGS, CONSUMERS, awardReviewPoints, type PointsAward } from "@/lib/data";

export default function SubmitReviewPage() {
  const [consumerId, setConsumerId] = useState("1");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [award, setAward] = useState<PointsAward | null>(null);

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
      const tagLabels = selectedTags
        .map((id) => BEHAVIORAL_TAGS.find((t) => t.id === id)?.label)
        .filter((label): label is string => Boolean(label));
      setAward(consumer ? awardReviewPoints(consumer.id, tagLabels) : null);
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const STAR_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  const positiveTags = BEHAVIORAL_TAGS.filter((t) => t.positive);
  const negativeTags = BEHAVIORAL_TAGS.filter((t) => !t.positive);

  if (submitted && consumer) {
    return (
      <div className="min-h-screen bg-plum">
        <div className="flex min-h-screen items-center justify-center px-6 pt-16">
          <div className="w-full max-w-md border border-hairline bg-plum-raised p-10 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-sage text-sage">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 font-serif text-2xl font-semibold text-ink">Review submitted</h2>
            <p className="mb-1 text-ink-muted">
              Your review of <span className="font-semibold text-ink">{consumer.name}</span> has been recorded.
            </p>
            <p className="mb-8 text-sm text-ink-muted">
              It will be reflected in their Repflip score within 24 hours.
            </p>

            <div className="mb-8 border border-hairline p-4 text-left">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-ink-muted">Rating submitted</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className={`h-4 w-4 ${i <= rating ? "star-filled" : "star-empty"}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {selectedTags.map((id) => {
                    const tag = BEHAVIORAL_TAGS.find((t) => t.id === id)!;
                    return (
                      <span key={id} className={`border-l-2 pl-1.5 text-xs font-medium ${tag.positive ? "border-sage text-sage" : "border-rust text-rust"}`}>
                        {tag.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {award ? (
              <div className="bonus-pop mb-8 border border-hairline bg-plum p-4 text-left">
                <p className="text-sm text-ink-muted">{consumer.name.split(" ")[0]} earned</p>
                <p className="font-serif text-3xl font-bold text-gold">+{award.total.toLocaleString()} pts</p>
                {award.bonusKind && (
                  <p className="mt-1.5 text-sm font-semibold text-gold">
                    {award.bonusKind === "multiplier"
                      ? `Bonus — 2× points, normally just ${award.base}`
                      : `Surprise bonus — +${award.bonusAmount} extra pts`}
                  </p>
                )}
              </div>
            ) : (
              selectedTags.length > 0 && (
                <p className="mb-8 text-xs text-ink-muted">No points awarded — reviews with concerns don&apos;t earn points.</p>
              )
            )}

            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="w-full rounded bg-gold px-6 py-3 text-sm font-semibold text-plum transition-colors hover:bg-gold-deep"
              >
                Back to dashboard
              </Link>
              <button
                onClick={() => { setSubmitted(false); setRating(0); setSelectedTags([]); setNotes(""); setAward(null); }}
                className="w-full rounded border border-hairline px-6 py-3 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
              >
                Submit another review
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-plum">
      <div className="mx-auto max-w-2xl px-6 pb-16 pt-28">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="mb-2 inline-block text-sm font-medium text-gold transition-colors hover:text-gold-deep">
            ← Dashboard
          </Link>
          <h1 className="font-serif text-4xl font-semibold text-ink md:text-5xl">Submit review</h1>
          <p className="mt-2 text-ink-muted">Your feedback shapes the trust economy for every business.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Consumer Select */}
          <div className="border border-hairline bg-plum-raised p-5">
            <label className="mb-3 block text-sm font-medium text-ink-muted">Consumer</label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {CONSUMERS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setConsumerId(c.id)}
                  className={`flex items-center gap-3 border p-3 text-left transition-colors ${
                    consumerId === c.id ? "border-gold bg-plum-sunken" : "border-hairline hover:border-gold"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-hairline font-serif text-sm font-semibold text-ink">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{c.name}</p>
                    <p className="text-xs text-ink-muted">{c.phone}</p>
                  </div>
                  {consumerId === c.id && (
                    <svg className="ml-auto h-4 w-4 shrink-0 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Star Rating */}
          <div className="border border-hairline bg-plum-raised p-5">
            <label className="mb-4 block text-sm font-medium text-ink-muted">
              Overall rating <span className="text-rust">*</span>
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
                  >
                    <svg
                      className={`h-9 w-9 transition-colors ${star <= (hovered || rating) ? "text-gold" : "text-hairline"}`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
              <div className="h-6">
                {(hovered || rating) > 0 && (
                  <span className="text-base font-semibold text-gold">{STAR_LABELS[hovered || rating]}</span>
                )}
              </div>
            </div>
          </div>

          {/* Behavioral Tags */}
          <div className="border border-hairline bg-plum-raised p-5">
            <label className="mb-4 block text-sm font-medium text-ink-muted">Behavioral tags</label>

            <div className="mb-4">
              <p className="mb-2 text-sm text-sage">Positive</p>
              <div className="flex flex-wrap gap-2">
                {positiveTags.map((tag) => {
                  const active = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`tag-interactive border px-3.5 py-1.5 text-sm font-medium ${
                        active ? "border-sage text-sage" : "border-hairline text-ink-muted"
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-rust">Concerns</p>
              <div className="flex flex-wrap gap-2">
                {negativeTags.map((tag) => {
                  const active = selectedTags.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`tag-interactive border px-3.5 py-1.5 text-sm font-medium ${
                        active ? "border-rust text-rust" : "border-hairline text-ink-muted"
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border border-hairline bg-plum-raised p-5">
            <label className="mb-3 block text-sm font-medium text-ink-muted">
              Notes <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the interaction — what went well or what didn't. Other businesses rely on your honesty."
              rows={4}
              className="w-full resize-none border border-hairline bg-plum p-4 text-sm leading-relaxed text-ink placeholder-ink-muted outline-none transition-colors focus:border-gold"
            />
            <div className="mt-2 flex justify-between">
              <p className="text-xs text-ink-muted">Be honest and factual. Reviews are verified against booking data.</p>
              <span className="text-xs text-ink-muted">{notes.length}/500</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={rating === 0 || submitting}
            className="flex w-full items-center justify-center gap-3 rounded bg-gold px-6 py-4 text-base font-semibold text-plum transition-colors hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-40"
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
              "Submit review"
            )}
          </button>

          {rating === 0 && (
            <p className="text-center text-xs text-ink-muted">Select a star rating to submit</p>
          )}
        </form>
      </div>
    </div>
  );
}
