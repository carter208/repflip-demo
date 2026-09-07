import { useEffect, useState } from "react";

// Animates a score count-up (eased) and reports when the reveal has
// finished, so callers can gate a "locking in" transition (e.g. a
// traffic-light color) on the same timeline. Re-runs whenever resetKey
// changes, so switching consumers (or re-running a lookup) replays it.
export function useScoreReveal(targetScore: number, resetKey: string | number, durationMs = 700) {
  const [displayScore, setDisplayScore] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [stampVisible, setStampVisible] = useState(false);

  useEffect(() => {
    setRevealed(false);
    setStampVisible(false);
    setDisplayScore(0);
    // setInterval instead of requestAnimationFrame: rAF fully pauses on a
    // backgrounded/hidden tab, which would freeze the reveal indefinitely.
    // A ~60fps interval keeps advancing (even if throttled) so it still
    // completes if the tab loses focus mid-animation.
    const stepMs = 16;
    const totalSteps = Math.max(1, Math.round(durationMs / stepMs));
    let step = 0;

    const id = setInterval(() => {
      step += 1;
      const progress = Math.min(step / totalSteps, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * targetScore));
      if (progress >= 1) {
        clearInterval(id);
        setRevealed(true);
      }
    }, stepMs);

    return () => clearInterval(id);
  }, [targetScore, resetKey, durationMs]);

  // A short beat after the count-up lands, so the "verified" stamp snaps in
  // as its own moment rather than arriving simultaneously with the number.
  useEffect(() => {
    if (!revealed) return;
    const t = setTimeout(() => setStampVisible(true), 220);
    return () => clearTimeout(t);
  }, [revealed]);

  return { displayScore, revealed, stampVisible };
}
