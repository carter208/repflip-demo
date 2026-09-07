"use client";

import { useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CONSUMERS, getCleanStreak } from "@/lib/data";
import { drawScoreCard } from "@/lib/shareCard";
import ShareCard from "@/components/ShareCard";

export default function SharePage() {
  const params = useParams<{ id: string }>();
  const consumer = CONSUMERS.find((c) => c.id === params?.id);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  if (!consumer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-plum px-6 text-center">
        <div>
          <p className="mb-2 font-serif text-2xl font-semibold text-ink">Score card not found</p>
          <Link href="/" className="text-gold transition-colors hover:text-gold-deep">
            ← Back to Repflip
          </Link>
        </div>
      </div>
    );
  }

  const streak = getCleanStreak(consumer.reviews);
  const firstName = consumer.name.split(" ")[0];

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await drawScoreCard(canvas, { name: consumer.name, tier: consumer.tier, score: consumer.score, streak });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `repflip-score-${firstName.toLowerCase()}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-plum px-6 pb-24 pt-32">
      <div className="mx-auto max-w-sm">
        <ShareCard name={consumer.name} tier={consumer.tier} score={consumer.score} streak={streak} />
        <canvas ref={canvasRef} className="hidden" />
        <button
          onClick={handleDownload}
          className="mt-6 w-full rounded bg-gold py-3 text-sm font-semibold text-plum transition-colors hover:bg-gold-deep"
        >
          Download PNG
        </button>
        <p className="mt-6 text-center text-sm text-ink-muted">
          Want a Repflip score of your own?{" "}
          <Link href="/how-it-works" className="text-gold transition-colors hover:text-gold-deep">
            See how it works →
          </Link>
        </p>
      </div>
    </div>
  );
}
