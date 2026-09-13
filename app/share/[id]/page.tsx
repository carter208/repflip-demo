"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { CONSUMERS, getCleanStreak } from "@/lib/data";
import { drawScoreCard } from "@/lib/shareCard";
import { isShareLinkActive } from "@/lib/shareLink";
import ShareCard from "@/components/ShareCard";

export default function SharePage() {
  const params = useParams<{ id: string }>();
  const consumer = CONSUMERS.find((c) => c.id === params?.id);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Share-link status is only known client-side (localStorage), so start
  // "checking" and resolve after mount rather than assuming active.
  const [linkStatus, setLinkStatus] = useState<"checking" | "active" | "inactive">("checking");

  useEffect(() => {
    if (!consumer) return;
    setLinkStatus(isShareLinkActive(consumer.id) ? "active" : "inactive");
  }, [consumer]);

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

  if (linkStatus === "checking") {
    return <div className="min-h-screen bg-plum" />;
  }

  if (linkStatus === "inactive") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-plum px-6 text-center">
        <div className="max-w-sm border border-hairline bg-plum-raised p-8">
          <p className="mb-2 font-serif text-xl font-semibold text-ink">This link isn&apos;t available</p>
          <p className="mb-6 text-sm leading-relaxed text-ink-muted">
            This score card is private, and either was never shared or the link was revoked or has
            expired. Repflip scores are private by default — only shared publicly when a consumer
            explicitly chooses to.
          </p>
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
