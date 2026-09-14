import Link from "next/link";
import {
  SCORE_BASELINE,
  TAG_WEIGHTS,
  TAG_CATEGORIES,
  RELIABILITY_ESCALATION_WEIGHTS,
  BEHAVIORAL_TAGS,
  TIER_CONFIG,
  getTierFromScore,
  ordinal,
  type Tier,
} from "@/lib/data";

// Tier ranges are derived by scanning every possible score against the real
// getTierFromScore function — never hand-typed — so this page can't drift
// out of sync with the actual tier thresholds.
function getTierRanges() {
  const ranges: { tier: Tier; min: number; max: number }[] = [];
  let currentTier = getTierFromScore(0);
  let start = 0;
  for (let score = 1; score <= 100; score++) {
    const tier = getTierFromScore(score);
    if (tier !== currentTier) {
      ranges.push({ tier: currentTier, min: start, max: score - 1 });
      currentTier = tier;
      start = score;
    }
  }
  ranges.push({ tier: currentTier, min: start, max: 100 });
  return ranges;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="h-1.5 w-1.5 bg-gold" />
      <span className="text-sm font-medium text-gold">{children}</span>
    </div>
  );
}

export default function HowScoringWorksPage() {
  const tierRanges = getTierRanges();
  const allTags = BEHAVIORAL_TAGS.map((t) => ({
    label: t.label,
    positive: t.positive,
    weight: TAG_WEIGHTS[t.label] ?? 0,
    category: TAG_CATEGORIES[t.label],
  }));
  const reliabilityTags = allTags.filter((t) => t.category === "reliability");
  const conductTags = allTags.filter((t) => t.category === "conduct");
  // The negative reliability tag(s) escalation actually applies to — derived,
  // not assumed, in case the categorization or weights change later.
  const escalatingTags = reliabilityTags.filter((t) => t.weight < 0);

  return (
    <div className="min-h-screen bg-plum">
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-32">
        <SectionLabel>Methodology</SectionLabel>

        <h1 className="mb-4 font-serif text-4xl font-semibold leading-tight text-ink md:text-5xl">
          How your score is calculated
        </h1>
        <p className="mb-12 max-w-xl text-lg leading-relaxed text-ink-muted">
          No hidden formula. Every reputation score on Repflip is built the same simple way,
          and this page states the whole thing — the same numbers used everywhere else in
          the product.
        </p>

        {/* The formula */}
        <div className="mb-6 border border-hairline bg-plum-raised p-8">
          <h2 className="mb-3 font-serif text-xl font-semibold text-ink">The formula</h2>
          <p className="mb-4 leading-relaxed text-ink-muted">
            Your score starts at a fixed baseline, then moves up or down by the weight of
            every behavioral tag on every review you&apos;ve received, clamped to the 0–100
            range. Tags fall into two categories that are treated differently (see below), and
            a review that&apos;s currently disputed doesn&apos;t count at all until it&apos;s
            resolved.
          </p>
          <div className="border border-hairline bg-plum p-4 text-center font-mono text-sm text-gold">
            score = clamp( {SCORE_BASELINE} + sum of each active review&apos;s tag weights, 0, 100 )
          </div>
        </div>

        {/* Baseline */}
        <div className="mb-6 border border-hairline bg-plum-raised p-8">
          <h2 className="mb-3 font-serif text-xl font-semibold text-ink">
            Why start at {SCORE_BASELINE}?
          </h2>
          <p className="leading-relaxed text-ink-muted">
            Every consumer starts at {SCORE_BASELINE} — inside the Silver range — before their
            first review. That&apos;s a deliberate middle ground: a brand-new consumer hasn&apos;t
            done anything to earn a top-tier score, but they also haven&apos;t done anything to
            be treated as high-risk. {SCORE_BASELINE} gives real reviews, positive or negative,
            room to move the score in either direction.
          </p>
        </div>

        {/* Two categories */}
        <div className="mb-6 border border-hairline bg-plum-raised p-8">
          <h2 className="mb-1 font-serif text-xl font-semibold text-ink">Two kinds of tags</h2>
          <p className="mb-5 text-sm text-ink-muted">
            Every tag belongs to one of two categories, and they&apos;re treated differently below.
          </p>

          <div className="mb-5">
            <p className="mb-2 text-sm font-semibold text-gold">Reliability — do they show up and follow through?</p>
            <div className="flex flex-col gap-1.5">
              {reliabilityTags.map((tag) => (
                <div
                  key={tag.label}
                  className={`flex items-center justify-between border-l-2 px-4 py-2.5 ${tag.positive ? "border-sage" : "border-rust"}`}
                >
                  <span className="text-sm font-medium text-ink">{tag.label}</span>
                  <span className={`text-sm font-semibold ${tag.positive ? "text-sage" : "text-rust"}`}>
                    {tag.positive ? `+${tag.weight} per review` : "escalating — see below"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-gold">Conduct — how do they behave and communicate?</p>
            <div className="flex flex-col gap-1.5">
              {conductTags.map((tag) => (
                <div
                  key={tag.label}
                  className={`flex items-center justify-between border-l-2 px-4 py-2.5 ${tag.positive ? "border-sage" : "border-rust"}`}
                >
                  <span className="text-sm font-medium text-ink">{tag.label}</span>
                  <span className={`text-sm font-semibold ${tag.positive ? "text-sage" : "text-rust"}`}>
                    {tag.weight > 0 ? "+" : ""}
                    {tag.weight} per review
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              Conduct tags are always flat — the first &ldquo;{conductTags.find((t) => !t.positive)?.label}&rdquo; costs
              exactly as much as the fifth. Character-based concerns don&apos;t get a grace period.
            </p>
          </div>
        </div>

        {/* Escalation */}
        <div className="mb-6 border border-hairline bg-plum-raised p-8">
          <h2 className="mb-3 font-serif text-xl font-semibold text-ink">
            Reliability slip-ups escalate — they aren&apos;t flat
          </h2>
          <p className="mb-4 leading-relaxed text-ink-muted">
            A single missed appointment is common for anyone with an unpredictable schedule —
            it shouldn&apos;t cost the same as an established pattern. So for a negative
            reliability tag ({escalatingTags.map((t) => t.label).join(", ")}), the cost depends
            on how many times you&apos;ve received that specific tag, counted in order:
          </p>
          <div className="flex flex-col gap-1.5">
            {RELIABILITY_ESCALATION_WEIGHTS.map((weight, i) => (
              <div key={i} className="flex items-center justify-between border-l-2 border-rust px-4 py-2.5">
                <span className="text-sm font-medium text-ink">{ordinal(i + 1)} occurrence</span>
                <span className="text-sm font-semibold text-rust">{weight} points</span>
              </div>
            ))}
            {escalatingTags.map((tag) => (
              <div key={tag.label} className="flex items-center justify-between border-l-2 border-rust px-4 py-2.5">
                <span className="text-sm font-medium text-ink">
                  {ordinal(RELIABILITY_ESCALATION_WEIGHTS.length + 1)} occurrence and beyond
                </span>
                <span className="text-sm font-semibold text-rust">{tag.weight} points (full weight)</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-muted">
            First offense, nearly forgiven. A genuine pattern, penalized in full. Positive
            reliability tags and every conduct tag don&apos;t escalate — only negative
            reliability tags do.
          </p>
        </div>

        {/* Disputes */}
        <div className="mb-10 border border-hairline bg-plum-raised p-8">
          <h2 className="mb-3 font-serif text-xl font-semibold text-ink">How disputes affect your score</h2>
          <div className="flex flex-col gap-3">
            <div className="border-l-2 border-hairline pl-4">
              <p className="text-sm font-semibold text-ink">While a review is disputed and pending</p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
                None of its tags count toward your score, and they don&apos;t count toward the
                escalation order above either — as far as your score is concerned, it&apos;s on
                hold, not counted either way.
              </p>
            </div>
            <div className="border-l-2 border-sage pl-4">
              <p className="text-sm font-semibold text-ink">If a dispute is resolved in your favor</p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">
                That review is permanently excluded from your score — as if it never happened.
                It still stays visible in your review history exactly as submitted; only its
                effect on your score is removed for good.
              </p>
            </div>
          </div>
        </div>

        {/* Tier thresholds */}
        <div className="mb-10 border border-hairline bg-plum-raised p-8">
          <h2 className="mb-5 font-serif text-xl font-semibold text-ink">What your score means</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tierRanges.map((t) => (
              <div key={t.tier} className="border border-hairline bg-plum p-3 text-center">
                <div className="mb-0.5 font-serif text-sm font-semibold" style={{ color: TIER_CONFIG[t.tier].color }}>
                  {t.tier}
                </div>
                <div className="text-xs text-ink-muted">
                  {t.min}–{t.max}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="border border-hairline bg-plum-raised p-10 text-center">
          <h3 className="mb-2 font-serif text-2xl font-semibold text-ink">See it applied to a real profile</h3>
          <p className="mb-6 text-ink-muted">
            Every profile shows this same math worked out for that specific consumer&apos;s reviews.
          </p>
          <Link
            href="/profile"
            className="rounded bg-gold px-8 py-3 text-sm font-semibold text-plum transition-colors hover:bg-gold-deep"
          >
            View a profile →
          </Link>
        </div>
      </div>
    </div>
  );
}
