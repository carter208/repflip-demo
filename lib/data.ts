export type Tier = "Bronze" | "Silver" | "Gold" | "Platinum";

export interface Review {
  id: string;
  businessName: string;
  businessType: string;
  rating: number;
  tags: string[];
  notes?: string;
  date: string;
  // True if an active streak freeze absorbed this review's negative tags,
  // shielding the clean streak instead of resetting it.
  protectedByFreeze?: boolean;
}

export interface Consumer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  score: number;
  tier: Tier;
  points: number;
  memberSince: string;
  reviews: Review[];
}

export const BEHAVIORAL_TAGS = [
  { id: "paid-on-time", label: "Paid on time", positive: true },
  { id: "clear-communicator", label: "Clear communicator", positive: true },
  { id: "respectful", label: "Respectful", positive: true },
  { id: "reliable", label: "Reliable", positive: true },
  { id: "followed-through", label: "Followed through", positive: true },
  { id: "no-show", label: "No-show", positive: false },
  { id: "payment-dispute", label: "Payment dispute", positive: false },
  { id: "difficult-to-reach", label: "Difficult to reach", positive: false },
  { id: "aggressive-rude", label: "Aggressive/rude", positive: false },
];

export function getTierFromScore(score: number): Tier {
  if (score >= 90) return "Platinum";
  if (score >= 75) return "Gold";
  if (score >= 55) return "Silver";
  return "Bronze";
}

export interface TierProgress {
  pct: number;
  nextTier: Tier | null;
  pointsToNext: number;
  max: number;
  min: number;
}

// Thresholds mirror getTierFromScore: Bronze 0-54, Silver 55-74, Gold 75-89, Platinum 90-100.
export function getTierProgress(score: number, tier: Tier): TierProgress {
  if (tier === "Platinum") return { pct: 100, nextTier: null, pointsToNext: 0, max: 100, min: 90 };
  if (tier === "Gold") return { pct: ((score - 75) / 15) * 100, nextTier: "Platinum", pointsToNext: 90 - score, max: 90, min: 75 };
  if (tier === "Silver") return { pct: ((score - 55) / 20) * 100, nextTier: "Gold", pointsToNext: 75 - score, max: 75, min: 55 };
  return { pct: (score / 55) * 100, nextTier: "Silver", pointsToNext: 55 - score, max: 55, min: 0 };
}

// Every consumer's reputation score starts at this baseline and is adjusted
// up or down by the weight of every behavioral tag across their reviews —
// see TAG_WEIGHTS / getScoreBreakdown below. The score stored on each
// Consumer is always computed this way (see deriveScore), so the number
// shown everywhere in the app is exactly the sum of the tags shown in the
// breakdown, never a separately hand-set value.
export const SCORE_BASELINE = 60;

// Per-tag weight toward the reputation score. Positive tags add, negative tags subtract.
export const TAG_WEIGHTS: Record<string, number> = {
  "Paid on time": 8,
  "Clear communicator": 5,
  "Respectful": 5,
  "Reliable": 4,
  "Followed through": 3,
  "No-show": -8,
  "Payment dispute": -8,
  "Difficult to reach": -4,
  "Aggressive/rude": -12,
};

export interface ScoreContribution {
  tag: string;
  count: number;
  points: number;
  positive: boolean;
}

// Single source of truth for which tags count as negative — derived from
// TAG_WEIGHTS instead of duplicating the tag list across pages.
export const NEGATIVE_TAGS: string[] = Object.keys(TAG_WEIGHTS).filter((tag) => TAG_WEIGHTS[tag] < 0);

export function isNegativeTag(tag: string): boolean {
  return (TAG_WEIGHTS[tag] ?? 0) < 0;
}

// Cost, in points, to hold one streak freeze. Sits mid-range among existing
// point costs in the app (partner offers run 200-500, gift cards 10,000).
export const FREEZE_COST = 250;

// ── Points accrual ──────────────────────────────────────────────────────

// Flat points a consumer earns for an ordinary positive review.
export const BASE_REVIEW_POINTS = 100;

// Chance a given positive review triggers a variable bonus — "sometimes,"
// not "usually": roughly 1 in 5.
const BONUS_CHANCE = 0.2;
const MULTIPLIER_FACTOR = 2;
const FLAT_BONUS_AMOUNT = 50;

export type BonusKind = "multiplier" | "flat" | null;

export interface PointsAward {
  base: number;
  bonusKind: BonusKind;
  bonusAmount: number;
  total: number;
}

// Rolls whether this review earns a bonus, and which kind. Exported (not
// inlined into awardReviewPoints) so the odds can be verified directly.
export function rollPointsAward(basePoints: number = BASE_REVIEW_POINTS): PointsAward {
  if (Math.random() >= BONUS_CHANCE) {
    return { base: basePoints, bonusKind: null, bonusAmount: 0, total: basePoints };
  }
  if (Math.random() < 0.5) {
    const total = basePoints * MULTIPLIER_FACTOR;
    return { base: basePoints, bonusKind: "multiplier", bonusAmount: total - basePoints, total };
  }
  return { base: basePoints, bonusKind: "flat", bonusAmount: FLAT_BONUS_AMOUNT, total: basePoints + FLAT_BONUS_AMOUNT };
}

// Awards points for a submitted review and applies them to the consumer's
// balance in place. Reviews with any negative tag earn nothing (matches the
// existing "every positive review earns points" copy elsewhere in the app).
export function awardReviewPoints(consumerId: string, tags: string[]): PointsAward | null {
  const consumer = CONSUMERS.find((c) => c.id === consumerId);
  if (!consumer) return null;
  if (tags.some(isNegativeTag)) return null;
  const award = rollPointsAward();
  consumer.points += award.total;
  return award;
}

// ── Mystery box ─────────────────────────────────────────────────────────

export const MYSTERY_BOX_COST = 150;

export interface MysteryReward {
  id: string;
  label: string;
  emoji: string;
  pointsDelta: number;
  weight: number;
}

// Weighted pool — small/common outcomes far more likely than the jackpot.
// Placeholder rewards only; no real fulfillment wired up yet.
export const MYSTERY_BOX_REWARDS: MysteryReward[] = [
  { id: "small", label: "+25 bonus points", emoji: "✨", pointsDelta: 25, weight: 35 },
  { id: "medium", label: "+75 bonus points", emoji: "💎", pointsDelta: 75, weight: 30 },
  { id: "discount", label: "10% off code: MYSTERY10", emoji: "🏷️", pointsDelta: 0, weight: 20 },
  { id: "large", label: "+150 bonus points", emoji: "🎁", pointsDelta: 150, weight: 10 },
  { id: "jackpot", label: "Jackpot! +500 bonus points", emoji: "🎆", pointsDelta: 500, weight: 5 },
];

export function rollMysteryReward(): MysteryReward {
  const totalWeight = MYSTERY_BOX_REWARDS.reduce((sum, r) => sum + r.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const reward of MYSTERY_BOX_REWARDS) {
    if (roll < reward.weight) return reward;
    roll -= reward.weight;
  }
  return MYSTERY_BOX_REWARDS[MYSTERY_BOX_REWARDS.length - 1];
}

// Consecutive clean (no negative tag) reviews, counting from the most
// recent backwards. A negative-tagged review breaks the streak — unless it
// was shielded by an active streak freeze (protectedByFreeze), in which
// case it's skipped rather than counted or treated as a break.
export function getCleanStreak(reviews: Review[]): number {
  let streak = 0;
  for (const review of reviews) {
    const hasNegativeTag = review.tags.some(isNegativeTag);
    if (!hasNegativeTag) {
      streak += 1;
      continue;
    }
    if (review.protectedByFreeze) continue;
    break;
  }
  return streak;
}

// Aggregates a consumer's real review tags into weighted score contributions,
// sorted by magnitude so the biggest drivers (good or bad) show first.
export function getScoreBreakdown(reviews: Review[]): ScoreContribution[] {
  const counts: Record<string, number> = {};
  reviews.forEach((r) => r.tags.forEach((t) => { counts[t] = (counts[t] ?? 0) + 1; }));
  return Object.entries(counts)
    .map(([tag, count]) => {
      const weight = TAG_WEIGHTS[tag] ?? 0;
      return { tag, count, points: weight * count, positive: weight >= 0 };
    })
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
}

export function deriveScore(reviews: Review[]): number {
  const adjustment = getScoreBreakdown(reviews).reduce((sum, c) => sum + c.points, 0);
  return Math.max(0, Math.min(100, SCORE_BASELINE + adjustment));
}

// Tiers read as colored text labels, not pill/badge containers — so each
// tier only needs its color, not a set of background/border/glow classes.
export const TIER_CONFIG: Record<Tier, { color: string }> = {
  Bronze: { color: "#b3703f" },
  Silver: { color: "#a39aad" },
  Gold: { color: "#d4a24e" },
  Platinum: { color: "#c9bce0" },
};

function makeConsumer(
  base: Omit<Consumer, "score" | "tier">
): Consumer {
  const score = deriveScore(base.reviews);
  return { ...base, score, tier: getTierFromScore(score) };
}

export const CONSUMERS: Consumer[] = [
  makeConsumer({
    id: "1",
    name: "Marcus Thompson",
    phone: "(312) 555-0142",
    email: "marcus.t@email.com",
    city: "Boise, ID",
    points: 4820,
    memberSince: "Jan 2024",
    reviews: [
      {
        id: "r1",
        businessName: "Meridian & Co.",
        businessType: "Boutique Retail",
        rating: 5,
        tags: ["Paid on time", "Clear communicator", "Respectful"],
        notes: "Marcus was incredibly easy to work with. Generous and left great feedback.",
        date: "Mar 28, 2026",
      },
      {
        id: "r2",
        businessName: "Sunset Ridge Apartments",
        businessType: "Property Management",
        rating: 5,
        tags: ["Reliable", "Paid on time", "Clear communicator"],
        notes: "Rent paid on the first every month, easy to reach, no issues at move-out.",
        date: "Feb 14, 2026",
      },
      {
        id: "r3",
        businessName: "Ready Set Fit",
        businessType: "Personal Training",
        rating: 5,
        tags: ["Respectful", "Followed through", "Paid on time"],
        date: "Jan 5, 2026",
      },
    ],
  }),
  makeConsumer({
    id: "2",
    name: "Sarah Chen",
    phone: "(415) 555-0287",
    email: "s.chen@email.com",
    city: "Nampa, ID",
    points: 2140,
    memberSince: "Mar 2024",
    reviews: [
      {
        id: "r4",
        businessName: "Bloom Crate Co.",
        businessType: "Subscription Box",
        rating: 4,
        tags: ["Paid on time", "Clear communicator"],
        notes: "Good customer, slight communication lag at first but resolved quickly.",
        date: "Apr 2, 2026",
      },
      {
        id: "r5",
        businessName: "Sunset Ridge Apartments",
        businessType: "Property Management",
        rating: 4,
        tags: ["Respectful", "Reliable"],
        date: "Feb 22, 2026",
      },
      {
        id: "r6",
        businessName: "Meridian & Co.",
        businessType: "Boutique Retail",
        rating: 3,
        tags: ["Difficult to reach"],
        notes: "Changed order details repeatedly and was slow to respond to follow-ups.",
        date: "Dec 10, 2025",
      },
    ],
  }),
  makeConsumer({
    id: "3",
    name: "DeShawn Williams",
    phone: "(713) 555-0093",
    email: "deshawn.w@email.com",
    city: "Meridian, ID",
    points: 880,
    memberSince: "Jun 2024",
    reviews: [
      {
        id: "r7",
        businessName: "Ready Set Fit",
        businessType: "Personal Training",
        rating: 3,
        tags: ["Paid on time"],
        notes: "Payment was fine but hard to pin down for scheduling sessions.",
        date: "Mar 15, 2026",
      },
      {
        id: "r8",
        businessName: "Bloom Crate Co.",
        businessType: "Subscription Box",
        rating: 2,
        tags: ["No-show", "Difficult to reach"],
        notes: "Missed a scheduled consultation call without notice. Eventually followed up.",
        date: "Jan 30, 2026",
      },
    ],
  }),
  makeConsumer({
    id: "4",
    name: "Rebecca Okafor",
    phone: "(202) 555-0318",
    email: "r.okafor@email.com",
    city: "Eagle, ID",
    points: 210,
    memberSince: "Sep 2024",
    reviews: [
      {
        id: "r9",
        businessName: "Meridian & Co.",
        businessType: "Boutique Retail",
        rating: 1,
        tags: ["No-show", "Payment dispute", "Aggressive/rude"],
        notes: "Did not show for scheduled pickup, disputed the charge, and was combative via text.",
        date: "Mar 5, 2026",
      },
      {
        id: "r10",
        businessName: "Sunset Ridge Apartments",
        businessType: "Property Management",
        rating: 2,
        tags: ["Payment dispute"],
        notes: "Attempted to dispute a legitimate late fee. Resolved after documentation provided.",
        date: "Nov 18, 2025",
      },
    ],
  }),
];
