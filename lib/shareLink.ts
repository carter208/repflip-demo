// Client-side simulation of a real share-link backend: this demo has no
// server, so "creating" or "revoking" a share link is stored in
// localStorage, keyed per consumer. A link is only ever active if the
// consumer explicitly created one and it hasn't expired or been revoked —
// this is what keeps the public /share/[id] page honest against the
// profile page's "private by default" claim.

export const SHARE_LINK_EXPIRY_DAYS = 30;

interface ShareLinkState {
  active: boolean;
  createdAt: number;
}

function storageKey(consumerId: string): string {
  return `repflip:shareLink:${consumerId}`;
}

function readState(consumerId: string): ShareLinkState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(storageKey(consumerId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ShareLinkState;
  } catch {
    return null;
  }
}

export function isShareLinkActive(consumerId: string): boolean {
  const state = readState(consumerId);
  if (!state || !state.active) return false;
  const ageMs = Date.now() - state.createdAt;
  return ageMs < SHARE_LINK_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
}

export function createShareLink(consumerId: string): void {
  window.localStorage.setItem(
    storageKey(consumerId),
    JSON.stringify({ active: true, createdAt: Date.now() })
  );
}

export function revokeShareLink(consumerId: string): void {
  window.localStorage.setItem(
    storageKey(consumerId),
    JSON.stringify({ active: false, createdAt: Date.now() })
  );
}
