"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const CONSUMER = { name: "Marcus Thompson", points: 4820, tier: "Platinum" as const };

const PAST_WINNERS = [
  { name: "Jennifer K.", prize: "$500 Cash", month: "March 2026", city: "Boise, ID" },
  { name: "David R.", prize: "$500 Cash", month: "February 2026", city: "Nampa, ID" },
  { name: "Amy T.", prize: "$500 Cash", month: "January 2026", city: "Meridian, ID" },
];

const PARTNER_OFFERS = [
  { name: "ProClean Services", type: "House Cleaning", offer: "$25 off your next cleaning", pts: 250, emoji: "🧹" },
  { name: "Elite HVAC Solutions", type: "HVAC Repair", offer: "Free diagnostic ($89 value)", pts: 500, emoji: "❄️" },
  { name: "Greenfield Landscaping", type: "Landscaping", offer: "10% off any project", pts: 300, emoji: "🌿" },
  { name: "Apex Plumbing", type: "Plumbing", offer: "$30 off service call", pts: 300, emoji: "🔧" },
  { name: "SunBright Solar", type: "Solar", offer: "Free consult + $50 credit", pts: 400, emoji: "☀️" },
  { name: "FreshCoat Painters", type: "Painting", offer: "Free color consultation", pts: 150, emoji: "🎨" },
];

const GIFT_CARDS = [
  { name: "Amazon Gift Card", value: "$100", pts: 10000, logo: "🛒" },
  { name: "Visa Gift Card", value: "$100", pts: 10000, logo: "💳" },
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

export default function RewardsPage() {
  const [entries, setEntries] = useState(3);
  const [points, setPoints] = useState(CONSUMER.points);
  const [entering, setEntering] = useState(false);
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set());

  const drawEnd = new Date("2026-05-01T00:00:00Z");
  const countdown = useCountdown(drawEnd);

  const enterDraw = () => {
    if (points < 500 || entering) return;
    setEntering(true);
    setTimeout(() => { setEntries((e) => e + 1); setPoints((p) => p - 500); setEntering(false); }, 800);
  };

  const redeemOffer = (name: string, cost: number) => {
    if (points < cost || redeemed.has(name)) return;
    setPoints((p) => p - cost);
    setRedeemed((prev) => new Set([...Array.from(prev), name]));
  };

  const dollarValue = (pts: number) => `$${(pts / 100).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-[#020810]">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 pb-24 pt-32">

        {/* Back nav */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Consumer Profile
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-blue-600" />
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">Your Rewards</span>
          </div>
          <h1 className="text-4xl font-black text-white md:text-5xl">🏆 Earn. Spend. Win.</h1>
          <p className="mt-2 text-slate-400">
            <span className="font-semibold text-white">{points.toLocaleString()} pts</span>
            {" "}available ·{" "}
            <span className="font-semibold text-emerald-400">{dollarValue(points)}</span>
            {" "}in value
          </p>
        </div>

        {/* ── Prize Draw ── */}
        <section className="mb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-yellow-400">
            🎰 Monthly Prize Draw
          </p>
          <div className="glass-card overflow-hidden rounded-2xl">
            {/* Hero */}
            <div className="relative overflow-hidden border-b border-yellow-900/30 bg-gradient-to-br from-yellow-950/40 to-amber-950/20 p-8 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.15),transparent_70%)] pointer-events-none" />
              <div className="relative">
                <div className="mb-2 text-6xl">💰</div>
                <div className="mb-1 text-5xl font-black text-white">$500</div>
                <div className="mb-5 font-semibold text-yellow-400">Cash Prize — April 2026 Draw</div>

                {/* Countdown */}
                <div className="mx-auto mb-6 grid max-w-xs grid-cols-4 gap-3">
                  {[
                    { val: pad(countdown.days), label: "Days" },
                    { val: pad(countdown.hours), label: "Hrs" },
                    { val: pad(countdown.minutes), label: "Min" },
                    { val: pad(countdown.seconds), label: "Sec" },
                  ].map(({ val, label }) => (
                    <div key={label} className="rounded-xl border border-yellow-800/40 bg-yellow-950/60 px-2 py-3">
                      <div className="text-2xl font-black text-white">{val}</div>
                      <div className="mt-0.5 text-xs text-yellow-700">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Stats row */}
                <div className="mb-6 flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-black text-white">{entries}</div>
                    <div className="text-xs text-slate-500">Your Entries</div>
                  </div>
                  <div className="h-8 w-px bg-yellow-900/40" />
                  <div className="text-center">
                    <div className="text-2xl font-black text-white">500</div>
                    <div className="text-xs text-slate-500">Pts / Entry</div>
                  </div>
                  <div className="h-8 w-px bg-yellow-900/40" />
                  <div className="text-center">
                    <div className="text-2xl font-black text-sky-200">{points.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Pts Balance</div>
                  </div>
                </div>

                <button
                  onClick={enterDraw}
                  disabled={points < 500 || entering}
                  className="rounded-xl bg-yellow-500 px-8 py-3 text-sm font-black text-yellow-950 shadow-lg shadow-yellow-500/30 transition-all hover:bg-yellow-400 hover:scale-[1.02] disabled:cursor-not-allowed disabled:scale-100 disabled:opacity-40"
                >
                  {entering ? "Entering…" : "Enter Draw — 500 pts"}
                </button>
                {points < 500 && (
                  <p className="mt-2 text-xs text-red-400">Not enough points. Keep earning!</p>
                )}
              </div>
            </div>

            {/* Past Winners */}
            <div className="p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">🏅 Past Winners</p>
              <div className="flex flex-col gap-2">
                {PAST_WINNERS.map((w) => (
                  <div
                    key={w.month}
                    className="flex items-center justify-between rounded-xl border border-blue-900/30 bg-blue-950/20 px-4 py-3"
                  >
                    <div>
                      <span className="text-sm font-semibold text-white">{w.name}</span>
                      <span className="ml-2 text-xs text-slate-500">{w.city}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-400">{w.prize}</div>
                      <div className="text-xs text-slate-600">{w.month}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Rewards Marketplace ── */}
        <section className="mb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-400">
            🛍️ Rewards Marketplace
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PARTNER_OFFERS.map((offer) => {
              const isRedeemed = redeemed.has(offer.name);
              const canAfford = points >= offer.pts && !isRedeemed;
              return (
                <div key={offer.name} className="glass-card flex flex-col rounded-2xl p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-blue-900/40 bg-blue-950/50 text-2xl">
                      {offer.emoji}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-white">{offer.name}</div>
                      <div className="text-xs text-slate-500">{offer.type}</div>
                    </div>
                  </div>
                  <p className="mb-4 flex-1 text-sm text-slate-300">{offer.offer}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-400">
                      {offer.pts.toLocaleString()} pts
                    </span>
                    {isRedeemed ? (
                      <span className="rounded-lg border border-emerald-700/40 bg-emerald-950/30 px-3 py-1.5 text-xs font-bold text-emerald-400">
                        ✓ Redeemed
                      </span>
                    ) : (
                      <button
                        onClick={() => redeemOffer(offer.name, offer.pts)}
                        disabled={!canAfford}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
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

        {/* ── Gift Cards ── */}
        <section>
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-400">
            💳 Gift Cards
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {GIFT_CARDS.map((card) => {
              const pct = Math.min((points / card.pts) * 100, 100);
              const locked = points < card.pts;
              return (
                <div
                  key={card.name}
                  className={`glass-card relative overflow-hidden rounded-2xl p-6 ${locked ? "opacity-80" : ""}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-transparent pointer-events-none" />
                  <div className="relative">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{card.logo}</span>
                        <div>
                          <div className="font-bold text-white">{card.name}</div>
                          <div className="text-xs text-slate-500">{card.value} value</div>
                        </div>
                      </div>
                      {locked && (
                        <span className="rounded-full border border-slate-700/40 bg-slate-800/60 px-3 py-1 text-xs font-bold text-slate-400">
                          🔒 Locked
                        </span>
                      )}
                    </div>
                    <div className="mb-1.5 flex justify-between text-xs">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-semibold text-white">
                        {points.toLocaleString()} / {card.pts.toLocaleString()} pts
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-950/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all"
                        style={{ width: `${pct}%`, boxShadow: "0 0 8px rgba(16,185,129,0.4)" }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-slate-500">
                        {locked
                          ? `${(card.pts - points).toLocaleString()} pts to go`
                          : "You have enough points!"}
                      </p>
                      <button
                        disabled={locked}
                        className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-xs text-slate-600">
            100 points = $1.00 value · Gift cards processed within 3 business days
          </p>
        </section>

        {/* Navigation footer — escape hatch so users are never trapped */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 border-t border-blue-900/30 pt-8">
          <Link
            href="/profile"
            className="rounded-lg border border-blue-800/40 bg-blue-950/30 px-5 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-blue-900/30 hover:text-white"
          >
            ← Consumer Profile
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-lg border border-blue-800/40 bg-blue-950/30 px-5 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-blue-900/30 hover:text-white"
          >
            How It Works
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-blue-800/40 bg-blue-950/30 px-5 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-blue-900/30 hover:text-white"
          >
            Business Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
