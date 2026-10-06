import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const { sendMail, createTransport } = vi.hoisted(() => {
  const sendMail = vi.fn().mockResolvedValue({});
  const createTransport = vi.fn(() => ({ sendMail }));
  return { sendMail, createTransport };
});

vi.mock("nodemailer", () => ({ default: { createTransport } }));
vi.mock("resend", () => ({ Resend: vi.fn() }));

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  sendMail.mockClear();
  createTransport.mockClear();
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("email sending", () => {
  it("sends through Gmail SMTP when SMTP_USER and SMTP_PASS are set", async () => {
    process.env.SMTP_USER = "sender@example.com";
    process.env.SMTP_PASS = "app-password";
    delete process.env.RESEND_API_KEY;
    const email = await import("@/lib/email");

    await email.sendStaffActivationEmail("staff@example.com", "https://x/set-password?token=t", "Midwife");

    expect(createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ service: "gmail", auth: { user: "sender@example.com", pass: "app-password" } })
    );
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ from: "sender@example.com", to: "staff@example.com" })
    );
    expect(email.isEmailUnconfigured()).toBe(false);
  });

  it("logs to the console and sends nothing when no provider is configured", async () => {
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.RESEND_API_KEY;
    vi.stubEnv("NODE_ENV", "development");
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const email = await import("@/lib/email");

    await email.sendStaffActivationEmail("staff@example.com", "https://x/set-password?token=t", "Midwife");

    expect(createTransport).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(expect.stringContaining("[DEV EMAIL] to=staff@example.com"));
    expect(email.isEmailUnconfigured()).toBe(true);
  });
});
