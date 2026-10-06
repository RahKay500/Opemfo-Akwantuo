import { describe, it, expect } from "vitest";
import { normalizeGhanaPhone } from "@/lib/utils";
import { rateLimit, clientIp } from "@/lib/rate-limit";

describe("normalizeGhanaPhone", () => {
  it.each([
    ["0241234567", "+233241234567"],
    ["024 123 4567", "+233241234567"],
    ["024-123-4567", "+233241234567"],
    ["233241234567", "+233241234567"],
    ["+233241234567", "+233241234567"],
  ])("normalizes %s to %s", (input, expected) => {
    expect(normalizeGhanaPhone(input)).toBe(expected);
  });

  it.each(["", "12345", "024123456", "02412345678", "+1 555 555 5555", "abcdefghij"])(
    "rejects %s",
    (input) => {
      expect(normalizeGhanaPhone(input)).toBeNull();
    }
  );
});

describe("rateLimit", () => {
  it("allows up to the limit, then blocks", () => {
    const key = `test-limit-${Math.random()}`;
    expect(rateLimit(key, 3, 60_000).success).toBe(true);
    expect(rateLimit(key, 3, 60_000).success).toBe(true);
    expect(rateLimit(key, 3, 60_000).success).toBe(true);
    expect(rateLimit(key, 3, 60_000).success).toBe(false);
  });

  it("counts each key separately", () => {
    const a = `test-sep-a-${Math.random()}`;
    const b = `test-sep-b-${Math.random()}`;
    rateLimit(a, 1, 60_000);
    expect(rateLimit(a, 1, 60_000).success).toBe(false);
    expect(rateLimit(b, 1, 60_000).success).toBe(true);
  });
});

describe("clientIp", () => {
  const req = (xff?: string) =>
    new Request("http://localhost/api", xff === undefined ? {} : { headers: { "x-forwarded-for": xff } });

  it("uses the last forwarded hop, not a client-supplied first hop", () => {
    expect(clientIp(req("1.2.3.4, 203.0.113.9"))).toBe("203.0.113.9");
  });

  it("returns a single hop as-is", () => {
    expect(clientIp(req("203.0.113.9"))).toBe("203.0.113.9");
  });

  it("returns unknown when there is no forwarded header", () => {
    expect(clientIp(req())).toBe("unknown");
  });
});
