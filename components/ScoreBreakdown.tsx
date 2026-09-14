"use client";

import { useState } from "react";
import Link from "next/link";
import { getScoreBreakdown, SCORE_BASELINE, TAG_CATEGORIES, type Review, type ScoreContribution } from "@/lib/data";

function categoryTotal(items: ScoreContribution[], category: "reliability" | "conduct") {
  return items
    .filter((item) => !item.suspended && TAG_CATEGORIES[item.tag] === category)
    .reduce((sum, item) => sum + item.points, 0);
}

function fmt(n: number) {
  return n > 0 ? `+${n}` : `${n}`;
}

export default function ScoreBreakdown({ reviews }: { reviews: Review[] }) {
  const [expanded, setExpanded] = useState(false);
  const items = getScoreBreakdown(reviews);
  const total = items.reduce((sum, item) => sum + item.points, 0);
  const clamped = Math.max(0, Math.min(100, SCORE_BASELINE + total));
  const hitFloor = SCORE_BASELINE + total < 0;
  const hitCeiling = SCORE_BASELINE + total > 100;

  const reliabilityTotal = categoryTotal(items, "reliability");
  const conductTotal = categoryTotal(items, "conduct");
  const hasSuspended = items.some((item) => item.suspended);
  const decayCount = items.filter((item) => item.decayNote).length;

  return (
    <div className="border border-hairline bg-plum-sunken p-4">
      <p className="mb-1 text-sm font-semibold text-ink">
        Score breakdown <span className="font-normal text-ink-muted">— starts at {SCORE_BASELINE}, adjusted by verified reviews</span>
      </p>
      <Link
        href="/how-scoring-works"
        className="mb-3 inline-block text-xs font-semibold text-gold transition-colors hover:text-gold-deep"
      >
        See how this is calculated →
      </Link>

      {/* Plain-language summary — the default view: no escalation/weight
          mechanics required to read this. */}
      <p className="mb-3 text-sm leading-relaxed text-ink-muted">
        Starting from a baseline of {SCORE_BASELINE}, how they&apos;ve shown up (
        <span className="font-semibold text-ink">Reliability {fmt(reliabilityTotal)}</span>) and how
        they&apos;ve treated people (
        <span className="font-semibold text-ink">Conduct {fmt(conductTotal)}</span>) add up to a score
        of <span className="font-semibold text-gold">{clamped}</span>.
        {hasSuspended ? " One review is currently disputed and isn't counted either way." : ""}
      </p>

      {decayCount > 0 && (
        <p className="mb-3 text-xs font-medium text-gold">
          {decayCount} {decayCount === 1 ? "reset" : "resets"} due to 12+ months clean
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between border border-hairline bg-plum px-3 py-1.5">
          <span className="text-sm text-ink-muted">Reliability</span>
          <span className={`text-sm font-semibold ${reliabilityTotal >= 0 ? "text-sage" : "text-rust"}`}>
            {fmt(reliabilityTotal)}
          </span>
        </div>
        <div className="flex items-center justify-between border border-hairline bg-plum px-3 py-1.5">
          <span className="text-sm text-ink-muted">Conduct</span>
          <span className={`text-sm font-semibold ${conductTotal >= 0 ? "text-sage" : "text-rust"}`}>
            {fmt(conductTotal)}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between border-t border-hairline px-3 pt-2.5">
          <span className="text-sm font-semibold text-ink">Score</span>
          <span className="font-serif text-sm font-bold text-gold">
            {clamped}
            {(hitFloor || hitCeiling) && <span className="ml-1 font-sans font-normal text-ink-muted">(clamped)</span>}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-xs font-semibold text-gold transition-colors hover:text-gold-deep"
      >
        {expanded ? "Hide the full calculation ▲" : "See the full calculation ▼"}
      </button>

      {expanded && (
        <div className="mt-3 flex flex-col gap-1.5 border-t border-hairline pt-3">
          <div className="flex items-center justify-between border border-hairline bg-plum px-3 py-1.5">
            <span className="text-sm text-ink-muted">Baseline</span>
            <span className="text-sm font-semibold text-ink">{SCORE_BASELINE}</span>
          </div>

          {items.length === 0 ? (
            <p className="px-3 py-2 text-sm text-ink-muted">No reviews yet — nothing to adjust the baseline.</p>
          ) : (
            items.map((item, idx) => (
              <div
                key={`${item.tag}-${idx}`}
                className={`flex items-center justify-between border-l-2 px-3 py-1.5 ${
                  item.suspended ? "border-dashed border-ink-muted" : item.positive ? "border-sage" : "border-rust"
                }`}
              >
                <span className={`text-sm ${item.suspended ? "text-ink-muted italic" : "text-ink"}`}>
                  {item.tag}
                  {item.count > 1 ? ` ×${item.count}` : ""}
                  {item.escalationNote ? ` (${item.escalationNote})` : ""}
                  {item.decayNote ? <span className="ml-1 text-xs italic text-ink-muted">— {item.decayNote}</span> : null}
                </span>
                {item.suspended ? (
                  <span className="text-xs font-medium text-ink-muted">pending dispute — not counted</span>
                ) : (
                  <span className={`text-sm font-semibold ${item.positive ? "text-sage" : "text-rust"}`}>
                    {item.points > 0 ? "+" : ""}
                    {item.points}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
