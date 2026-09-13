import Link from "next/link";
import { getScoreBreakdown, SCORE_BASELINE, type Review } from "@/lib/data";

export default function ScoreBreakdown({ reviews }: { reviews: Review[] }) {
  const items = getScoreBreakdown(reviews);
  const total = items.reduce((sum, item) => sum + item.points, 0);
  const clamped = Math.max(0, Math.min(100, SCORE_BASELINE + total));
  const hitFloor = SCORE_BASELINE + total < 0;
  const hitCeiling = SCORE_BASELINE + total > 100;

  return (
    <div className="rounded-2xl border border-blue-800/40 bg-blue-950/30 p-4">
      <p className="mb-1 text-sm font-bold text-white">
        Score breakdown <span className="font-normal text-slate-500">— starts at {SCORE_BASELINE}, adjusted by verified reviews</span>
      </p>
      <Link
        href="/how-scoring-works"
        className="mb-3 inline-block text-xs font-semibold text-blue-400 transition-colors hover:text-blue-300"
      >
        See how this is calculated →
      </Link>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between rounded-lg bg-blue-950/50 px-3 py-1.5">
          <span className="text-sm text-slate-400">Baseline</span>
          <span className="text-sm font-bold text-slate-300">{SCORE_BASELINE}</span>
        </div>

        {items.length === 0 ? (
          <p className="px-3 py-2 text-sm text-slate-600">No reviews yet — nothing to adjust the baseline.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.tag}
              className={`flex items-center justify-between rounded-lg border px-3 py-1.5 ${
                item.positive ? "border-emerald-900/30 bg-emerald-950/20" : "border-red-900/30 bg-red-950/20"
              }`}
            >
              <span className="text-sm text-slate-300">
                {item.tag}
                {item.count > 1 ? ` ×${item.count}` : ""}
              </span>
              <span className={`text-sm font-bold ${item.positive ? "text-emerald-400" : "text-red-400"}`}>
                {item.points > 0 ? "+" : ""}
                {item.points}
              </span>
            </div>
          ))
        )}

        <div className="mt-1 flex items-center justify-between border-t border-blue-900/40 px-3 pt-2.5">
          <span className="text-sm font-bold text-white">Score</span>
          <span className="text-sm font-black text-white">
            {clamped}
            {(hitFloor || hitCeiling) && <span className="ml-1 font-normal text-slate-500">(clamped)</span>}
          </span>
        </div>
      </div>
    </div>
  );
}
