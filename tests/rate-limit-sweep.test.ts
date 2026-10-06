import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  vi.resetModules();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("rate limiter memory", () => {
  it("drops expired entries once the sweep interval has passed", async () => {
    const { rateLimit, trackedKeyCount } = await import("@/lib/rate-limit");

    for (let i = 0; i < 500; i++) rateLimit(`ip-${i}`, 5, 60_000);
    expect(trackedKeyCount()).toBe(500);

    vi.advanceTimersByTime(2 * 60_000);
    rateLimit("fresh", 5, 60_000);

    expect(trackedKeyCount()).toBe(1);
  });

  it("keeps entries whose window has not yet expired", async () => {
    const { rateLimit, trackedKeyCount } = await import("@/lib/rate-limit");

    rateLimit("still-active", 5, 10 * 60_000);
    vi.advanceTimersByTime(2 * 60_000);
    rateLimit("other", 5, 60_000);

    expect(trackedKeyCount()).toBe(2);
  });
});
