import Link from "next/link";
import { getScoreBreakdown, SCORE_BASELINE, type Review } from "@/lib/data";

export default function ScoreBreakdown({ reviews }: { reviews: Review[] }) {
  const items = getScoreBreakdown(reviews);
  const total = items.reduce((sum, item) => sum + item.points, 0);
  const clamped = Math.max(0, Math.min(100, SCORE_BASELINE + total));
  const hitFloor = SCORE_BASELINE + total < 0;
  const hitCeiling = SCORE_BASELINE + total > 100;

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

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between border border-hairline bg-plum px-3 py-1.5">
          <span className="text-sm text-ink-muted">Baseline</span>
          <span className="text-sm font-semibold text-ink">{SCORE_BASELINE}</span>
        </div>

        {items.length === 0 ? (
          <p className="px-3 py-2 text-sm text-ink-muted">No reviews yet — nothing to adjust the baseline.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.tag}
              className={`flex items-center justify-between border-l-2 px-3 py-1.5 ${
                item.positive ? "border-sage" : "border-rust"
              }`}
            >
              <span className="text-sm text-ink">
                {item.tag}
                {item.count > 1 ? ` ×${item.count}` : ""}
              </span>
              <span className={`text-sm font-semibold ${item.positive ? "text-sage" : "text-rust"}`}>
                {item.points > 0 ? "+" : ""}
                {item.points}
              </span>
            </div>
          ))
        )}

        <div className="mt-1 flex items-center justify-between border-t border-hairline px-3 pt-2.5">
          <span className="text-sm font-semibold text-ink">Score</span>
          <span className="font-serif text-sm font-bold text-gold">
            {clamped}
            {(hitFloor || hitCeiling) && <span className="ml-1 font-sans font-normal text-ink-muted">(clamped)</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
