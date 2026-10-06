// In-memory fixed-window rate limiter. Fine for a single Next.js server process
// in dev/small deployments; swap for @upstash/ratelimit + Redis once running
// multiple instances, since this state doesn't survive a restart or scale-out.
const hits = new Map<string, { count: number; resetAt: number }>();

const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = 0;

function sweepExpired(now: number): void {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, entry] of hits) {
    if (entry.resetAt <= now) hits.delete(key);
  }
}

export function trackedKeyCount(): number {
  return hits.size;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweepExpired(now);
  const entry = hits.get(key);

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

const FIFTEEN_MINUTES = 15 * 60_000;

// The last x-forwarded-for hop is the one the platform appends; earlier hops
// are client-supplied and would let an attacker rotate its own bucket.
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const hops = forwarded?.split(",").map((hop) => hop.trim()).filter(Boolean) ?? [];
  return hops[hops.length - 1] ?? "unknown";
}

export function limitAttempts(scope: string, key: string, limit: number): boolean {
  return rateLimit(`${scope}:${key}`, limit, FIFTEEN_MINUTES).success;
}

export const TOO_MANY_ATTEMPTS = "Too many attempts. Please wait a few minutes and try again.";
