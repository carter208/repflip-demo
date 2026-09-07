import { TIER_CONFIG, type Tier } from "@/lib/data";

export default function ShareCard({ name, tier, score, streak }: { name: string; tier: Tier; score: number; streak: number }) {
  const cfg = TIER_CONFIG[tier];
  const circumference = 2 * Math.PI * 80;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm border border-hairline bg-plum">
      <div className="flex h-full flex-col items-center justify-between p-8 text-center">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center bg-gold">
            <span className="font-serif text-base font-bold text-plum">R</span>
          </div>
          <span className="font-serif text-lg font-semibold text-ink">
            Rep<span className="text-gold">flip</span>
          </span>
        </div>

        <div className="relative flex h-44 w-44 items-center justify-center">
          <svg className="absolute h-44 w-44 -rotate-90" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="80" fill="none" stroke="#4a3a52" strokeWidth="12" />
            <circle
              cx="90" cy="90" r="80" fill="none" stroke="#d4a24e" strokeWidth="12"
              strokeDasharray={`${progress} ${circumference}`}
            />
          </svg>
          <div>
            <div className="font-serif text-6xl font-bold leading-none text-gold">{score}</div>
            <div className="mt-1 text-xs text-ink-muted">out of 100</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="font-serif text-base font-semibold" style={{ color: cfg.color }}>
            {tier} member
          </span>
          {streak > 0 && (
            <span className="text-sm text-ink-muted">
              {streak} clean review{streak === 1 ? "" : "s"} in a row
            </span>
          )}
          <span className="font-serif text-base font-semibold text-ink">{name}</span>
        </div>

        <div className="flex w-full flex-col items-center gap-1 border-t border-hairline pt-3">
          <span className="text-sm font-semibold text-gold">repflip.app</span>
          <span className="text-[11px] text-ink-muted">Know who you&apos;re dealing with before you say yes.</span>
        </div>
      </div>
    </div>
  );
}
