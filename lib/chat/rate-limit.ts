/**
 * Per-visitor message limits for the chat route, so one visitor can't use up the shared
 * Groq free-plan quota (which applies to the whole account).
 *
 * In-memory: fine for a single server. On serverless hosting each instance keeps its own counts,
 * so treat this as a soft limit — Groq's own 429s remain the hard backstop.
 *
 * Off in development: locally every request shares one address, so testing would hit the limit.
 */

const ENABLED = process.env.NODE_ENV === "production";

const WINDOWS = [
  { ms: 10 * 60 * 1000, max: 12 }, // 12 messages per 10 minutes
  { ms: 24 * 60 * 60 * 1000, max: 40 }, // 40 messages per day
];

const hits = new Map<string, number[]>();

export function checkRateLimit(key: string, now = Date.now()): { ok: true } | { ok: false; retryAfterSeconds: number } {
  if (!ENABLED) return { ok: true };
  const longest = WINDOWS[WINDOWS.length - 1].ms;
  const recent = (hits.get(key) ?? []).filter((t) => now - t < longest);

  for (const { ms, max } of WINDOWS) {
    const inWindow = recent.filter((t) => now - t < ms);
    if (inWindow.length >= max) {
      hits.set(key, recent);
      return { ok: false, retryAfterSeconds: Math.ceil((inWindow[0] + ms - now) / 1000) };
    }
  }

  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound on a long-running server.
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= longest)) hits.delete(k);
  }
  return { ok: true };
}
