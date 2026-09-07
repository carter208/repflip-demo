"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MYSTERY_BOX_COST, rollMysteryReward, type MysteryReward } from "@/lib/data";

const CONSUMER = { name: "Marcus Thompson", points: 4820, tier: "Platinum" as const };

const PAST_WINNERS = [
  { name: "Jennifer K.", prize: "$500 cash", month: "March 2026", city: "Boise, ID" },
  { name: "David R.", prize: "$500 cash", month: "February 2026", city: "Nampa, ID" },
  { name: "Amy T.", prize: "$500 cash", month: "January 2026", city: "Meridian, ID" },
];

const PARTNER_OFFERS = [
  { name: "Meridian & Co.", type: "Boutique retail", offer: "$25 off your next purchase", pts: 250 },
  { name: "Sunset Ridge Apartments", type: "Property management", offer: "$50 credit toward next month's rent", pts: 500 },
  { name: "Ready Set Fit", type: "Personal training", offer: "Free training session ($75 value)", pts: 400 },
  { name: "Bloom Crate Co.", type: "Subscription box", offer: "Free box upgrade", pts: 300 },
  { name: "Aperture Studio", type: "Photography", offer: "Free print package", pts: 200 },
  { name: "Golden Spoon Catering", type: "Event catering", offer: "10% off your next event", pts: 350 },
];

const GIFT_CARDS = [
  { name: "Amazon gift card", value: "$100", pts: 10000 },
  { name: "Visa gift card", value: "$100", pts: 10000 },
];

type TimeLeft = { days: number; hours: number; minutes: number; seconds: number };

function useCountdown(target: Date): TimeLeft {
  const [t, setT] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setT({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setT({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

function pad(n: number) { return String(n).padStart(2, "0"); }

// Stable reference outside component — avoids infinite useEffect loop
// (a new Date() inside the component would change reference on every render,
//  triggering useCountdown's [target] dependency infinitely)
const DRAW_END = new Date("2026-05-01T00:00:00Z");

export default function RewardsPage() {
  const [entries, setEntries] = useState(3);
  const [points, setPoints] = useState(CONSUMER.points);
  const [entering, setEntering] = useState(false);
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set());
  const [redeemedHistory, setRedeemedHistory] = useState<{ name: string; pts: number; date: string }[]>([]);
  const [boxOpening, setBoxOpening] = useState(false);
  const [boxReveal, setBoxReveal] = useState<MysteryReward | null>(null);
  const [boxHistory, setBoxHistory] = useState<{ reward: MysteryReward; date: string }[]>([]);

  const countdown = useCountdown(DRAW_END);

  const openMysteryBox = () => {
    if (points < MYSTERY_BOX_COST || boxOpening) return;
    setPoints((p) => p - MYSTERY_BOX_COST);
    setBoxOpening(true);
    setBoxReveal(null);
    setTimeout(() => {
      const reward = rollMysteryReward();
      if (reward.pointsDelta > 0) setPoints((p) => p + reward.pointsDelta);
      const dateStr = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      setBoxHistory((prev) => [{ reward, date: dateStr }, ...prev]);
      setBoxReveal(reward);
      setBoxOpening(false);
    }, 900);
  };

  const enterDraw = () => {
    if (points < 500 || entering) return;
    setEntering(true);
    setTimeout(() => { setEntries((e) => e + 1); setPoints((p) => p - 500); setEntering(false); }, 800);
  };

  const redeemOffer = (name: string, cost: number) => {
    if (points < cost || redeemed.has(name)) return;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setPoints((p) => p - cost);
    setRedeemed((prev) => new Set([...Array.from(prev), name]));
    setRedeemedHistory((prev) => [{ name, pts: cost, date: dateStr }, ...prev]);
  };

  const dollarValue = (pts: number) => `$${(pts / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-plum">
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-32">
        {/* ── Back link ── */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-gold">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-medium text-gold">Your rewards</p>
          <h1 className="font-serif text-4xl font-semibold text-ink md:text-5xl">Earn. Spend. Win.</h1>
          <p className="mt-2 text-ink-muted">
            <span className="font-semibold text-gold">{points.toLocaleString()} pts</span> available (
            {dollarValue(points)} in value)
          </p>
        </div>

        {/* ── Prize Draw ── */}
        <section className="mb-8">
          <p className="mb-3 text-sm font-medium text-ink-muted">Monthly prize draw</p>
          <div className="border border-hairline bg-plum-raised">
            <div className="border-b border-hairline p-8 text-center">
              <div className="mb-1 font-serif text-5xl font-bold text-gold">$500</div>
              <div className="mb-5 text-sm font-medium text-ink-muted">Cash prize — April 2026 draw</div>

              {/* Countdown */}
              <div className="mx-auto mb-6 grid max-w-xs grid-cols-4 gap-px border border-hairline bg-hairline">
                {[
                  { val: pad(countdown.days), label: "Days" },
                  { val: pad(countdown.hours), label: "Hrs" },
                  { val: pad(countdown.minutes), label: "Min" },
                  { val: pad(countdown.seconds), label: "Sec" },
                ].map(({ val, label }) => (
                  <div key={label} className="bg-plum-raised px-2 py-3">
                    <div className="font-serif text-2xl font-bold text-ink">{val}</div>
                    <div className="mt-0.5 text-xs text-ink-muted">{label}</div>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="mb-6 flex items-center justify-center gap-8">
                <div className="text-center">
                  <div className="font-serif text-2xl font-bold text-ink">{entries}</div>
                  <div className="text-xs text-ink-muted">Your entries</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-2xl font-bold text-ink">500</div>
                  <div className="text-xs text-ink-muted">Pts per entry</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-2xl font-bold text-gold">{points.toLocaleString()}</div>
                  <div className="text-xs text-ink-muted">Pts balance</div>
                </div>
              </div>

              <button
                onClick={enterDraw}
                disabled={points < 500 || entering}
                className="rounded bg-gold px-8 py-3 text-sm font-semibold text-plum transition-colors hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-40"
              >
                {entering ? "Entering…" : "Enter draw — 500 pts"}
              </button>
              {points < 500 && (
                <p className="mt-2 text-xs text-rust">Not enough points. Keep earning.</p>
              )}
            </div>

            {/* Past Winners */}
            <div className="p-6">
              <p className="mb-3 text-sm font-medium text-ink-muted">Past winners</p>
              <div className="flex flex-col divide-y divide-hairline">
                {PAST_WINNERS.map((w) => (
                  <div key={w.month} className="flex items-center justify-between py-2.5">
                    <div>
                      <span className="text-sm font-semibold text-ink">{w.name}</span>
                      <span className="ml-2 text-xs text-ink-muted">{w.city}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gold">{w.prize}</div>
                      <div className="text-xs text-ink-muted">{w.month}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Mystery Box ── */}
        <section className="mb-8">
          <p className="mb-3 text-sm font-medium text-ink-muted">Mystery box</p>
          <div className="border border-hairline bg-plum-raised p-8 text-center">
            {boxReveal ? (
              <div className="bonus-pop flex flex-col items-center gap-3">
                <p className="font-serif text-xl font-semibold text-gold">{boxReveal.label}</p>
                <p className="text-xs text-ink-muted">Added to your account</p>
                <button
                  onClick={() => setBoxReveal(null)}
                  disabled={points < MYSTERY_BOX_COST}
                  className="mt-2 rounded bg-gold px-6 py-2.5 text-sm font-semibold text-plum transition-colors hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Open another — {MYSTERY_BOX_COST} pts
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className={`h-16 w-16 border-2 border-gold ${boxOpening ? "box-shake" : ""}`} />
                <p className="max-w-sm text-sm text-ink-muted">
                  {boxOpening ? "Opening…" : "A random reward, every time. Small bonuses, discount codes, and the occasional jackpot."}
                </p>
                <button
                  onClick={openMysteryBox}
                  disabled={points < MYSTERY_BOX_COST || boxOpening}
                  className="rounded bg-gold px-8 py-3 text-sm font-semibold text-plum transition-colors hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {boxOpening ? "Opening…" : `Open mystery box — ${MYSTERY_BOX_COST} pts`}
                </button>
                {points < MYSTERY_BOX_COST && !boxOpening && (
                  <p className="text-xs text-rust">Not enough points. Keep earning.</p>
                )}
              </div>
            )}
          </div>

          {boxHistory.length > 0 && (
            <div className="mt-3 flex flex-col divide-y divide-hairline border-x border-hairline">
              {boxHistory.slice(0, 5).map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-plum-raised px-4 py-2.5">
                  <p className="truncate text-sm font-medium text-ink">{item.reward.label}</p>
                  <p className="shrink-0 text-xs text-ink-muted">Opened {item.date}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Rewards Marketplace ── */}
        <section className="mb-8">
          <p className="mb-3 text-sm font-medium text-ink-muted">Rewards marketplace</p>
          <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
            {PARTNER_OFFERS.map((offer) => {
              const isRedeemed = redeemed.has(offer.name);
              const canAfford = points >= offer.pts && !isRedeemed;
              return (
                <div key={offer.name} className="flex flex-col bg-plum-raised p-5">
                  <div className="mb-3">
                    <div className="truncate text-sm font-semibold text-ink">{offer.name}</div>
                    <div className="text-xs text-ink-muted">{offer.type}</div>
                  </div>
                  <p className="mb-4 flex-1 text-sm text-ink-muted">{offer.offer}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gold">{offer.pts.toLocaleString()} pts</span>
                    {isRedeemed ? (
                      <span className="text-xs font-semibold text-sage">Redeemed</span>
                    ) : (
                      <button
                        onClick={() => redeemOffer(offer.name, offer.pts)}
                        disabled={!canAfford}
                        className="rounded border border-hairline px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Redeem
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Redeemed Rewards History ── */}
        {redeemedHistory.length > 0 && (
          <section className="mb-8">
            <p className="mb-3 text-sm font-medium text-ink-muted">Redeemed</p>
            <div className="flex flex-col divide-y divide-hairline border-x border-hairline">
              {redeemedHistory.map((item, i) => (
                <div key={i} className="flex items-center justify-between bg-plum-raised px-4 py-3">
                  <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-rust">−{item.pts.toLocaleString()} pts</p>
                    <p className="text-xs text-ink-muted">Redeemed {item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Gift Cards ── */}
        <section>
          <p className="mb-3 text-sm font-medium text-ink-muted">Gift cards</p>
          <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
            {GIFT_CARDS.map((card) => {
              const pct = Math.min((points / card.pts) * 100, 100);
              const locked = points < card.pts;
              return (
                <div key={card.name} className="bg-plum-raised p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <div className="font-serif font-semibold text-ink">{card.name}</div>
                      <div className="text-xs text-ink-muted">{card.value} value</div>
                    </div>
                    {locked && <span className="text-xs font-medium text-ink-muted">Locked</span>}
                  </div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-ink-muted">Progress</span>
                    <span className="font-semibold text-ink">
                      {points.toLocaleString()} / {card.pts.toLocaleString()} pts
                    </span>
                  </div>
                  <div className="h-1 w-full bg-hairline">
                    <div className="h-full bg-gold transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-ink-muted">
                      {locked ? `${(card.pts - points).toLocaleString()} pts to go` : "You have enough points."}
                    </p>
                    <button
                      disabled={locked}
                      className="rounded border border-hairline px-4 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Redeem
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-ink-muted">
            100 points = $1.00 value. Gift cards processed within 3 business days.
          </p>
        </section>

        {/* Navigation footer — escape hatch so users are never trapped */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-hairline pt-8">
          <Link href="/profile" className="text-sm font-medium text-ink-muted transition-colors hover:text-gold">
            ← Consumer profile
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium text-ink-muted transition-colors hover:text-gold">
            How it works
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-ink-muted transition-colors hover:text-gold">
            Business dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
