import { TIER_CONFIG, type Tier } from "./data";

export interface ShareCardData {
  name: string;
  tier: Tier;
  score: number;
  streak: number;
}

const CARD_W = 1080;
const CARD_H = 1350;

const PLUM = "#2b1e30";
const HAIRLINE = "#4a3a52";
const INK = "#ece4de";
const INK_MUTED = "#b09fb8";
const GOLD = "#d4a24e";

// Renders a shareable score card onto the given canvas. Pure canvas 2D —
// no external image libraries — so it can be rasterized straight to PNG
// via canvas.toDataURL for download. Flat fills only, no gradients or glow.
export async function drawScoreCard(canvas: HTMLCanvasElement, data: ShareCardData): Promise<void> {
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Fonts not ready — fall back to system-ui below, still legible.
    }
  }

  const cfg = TIER_CONFIG[data.tier];
  const cx = CARD_W / 2;
  const serif = "'Zilla Slab', Georgia, serif";
  const sans = "'Work Sans', system-ui, sans-serif";

  // Flat background — no gradient
  ctx.fillStyle = PLUM;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Card border — sharp corners, hairline
  ctx.strokeStyle = HAIRLINE;
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, CARD_W - 56, CARD_H - 56);

  // Wordmark — a flat square mark, not a rounded/circular icon
  ctx.fillStyle = GOLD;
  ctx.fillRect(90, 92, 56, 56);
  ctx.fillStyle = PLUM;
  ctx.font = `700 30px ${serif}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("R", 118, 122);

  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = `600 40px ${serif}`;
  ctx.fillStyle = INK;
  ctx.fillText("Repflip", 168, 120);

  // Score ring — flat gold stroke, no glow
  const ringCx = cx;
  const ringCy = 610;
  const ringR = 220;
  ctx.lineWidth = 20;
  ctx.strokeStyle = HAIRLINE;
  ctx.beginPath();
  ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
  ctx.stroke();

  const pct = Math.max(0, Math.min(1, data.score / 100));
  ctx.strokeStyle = GOLD;
  ctx.lineCap = "butt";
  ctx.beginPath();
  ctx.arc(ringCx, ringCy, ringR, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = GOLD;
  ctx.font = `700 190px ${serif}`;
  ctx.fillText(String(data.score), ringCx, ringCy - 6);
  ctx.font = `500 28px ${sans}`;
  ctx.fillStyle = INK_MUTED;
  ctx.fillText("out of 100", ringCx, ringCy + 92);

  // Tier — a colored text label, not a badge shape
  ctx.font = `600 34px ${serif}`;
  ctx.fillStyle = cfg.color;
  ctx.fillText(`${data.tier} member`, cx, 900);

  // Streak — plain text row, no icon
  if (data.streak > 0) {
    ctx.font = `500 28px ${sans}`;
    ctx.fillStyle = INK_MUTED;
    const streakText = `${data.streak} clean review${data.streak === 1 ? "" : "s"} in a row`;
    ctx.fillText(streakText, cx, 950);
  }

  // Name
  ctx.font = `600 42px ${serif}`;
  ctx.fillStyle = INK;
  ctx.fillText(data.name, cx, 1120);

  // Divider
  ctx.strokeStyle = HAIRLINE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 140, 1170);
  ctx.lineTo(cx + 140, 1170);
  ctx.stroke();

  // Footer
  ctx.font = `600 26px ${sans}`;
  ctx.fillStyle = GOLD;
  ctx.fillText("repflip.app", cx, 1220);
  ctx.font = `400 21px ${sans}`;
  ctx.fillStyle = INK_MUTED;
  ctx.fillText("Know who you're dealing with before you say yes.", cx, 1258);
}
