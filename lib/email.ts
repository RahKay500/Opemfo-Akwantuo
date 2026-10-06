import { Resend } from "resend";
import nodemailer from "nodemailer";

const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

// Gmail (App Password) is preferred when configured; Resend is the fallback.
// Neither set means every trigger logs to the console instead of throwing,
// so auth flows stay testable.
const smtp =
  SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({ service: "gmail", auth: { user: SMTP_USER, pass: SMTP_PASS } })
    : null;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (smtp && SMTP_USER) {
    try {
      await smtp.sendMail({ from: SMTP_USER, to, subject, html });
    } catch (error) {
      console.error(`SMTP email failed for ${to}:`, error);
    }
    return;
  }

  if (!resend) {
    console.log(`[DEV EMAIL] to=${to} subject=${subject}\n${html}`);
    return;
  }

  const { error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
  if (error) {
    console.error(`Resend email failed for ${to}:`, error);
  }
}

export async function sendAdminActivationEmail(
  email: string,
  link: string,
  roleLabel: string,
  jurisdictionName: string
): Promise<void> {
  await sendEmail(
    email,
    "Set up your Ɔpemfoɔ Akwantuo admin account",
    `<p>You've been added as the ${roleLabel} for ${jurisdictionName} on Ɔpemfoɔ Akwantuo.</p>
     <p><a href="${link}">Click here to set your password and activate your account</a>.</p>
     <p>This link expires in 48 hours.</p>`
  );
}

export async function sendStaffActivationEmail(email: string, link: string, roleLabel: string): Promise<void> {
  await sendEmail(
    email,
    "Set up your Ɔpemfoɔ Akwantuo account",
    `<p>Welcome to Ɔpemfoɔ Akwantuo. You've been added as a ${roleLabel}.</p>
     <p><a href="${link}">Click here to set your password and activate your account</a>.</p>
     <p>This link expires in 48 hours.</p>`
  );
}

// True when there's no real email provider wired up, so callers can surface
// the activation link directly in the API response instead of it going
// nowhere. Same prod-safety gate shape as lib/hubtel.ts's isSmsUnconfigured —
// a real production deploy stays safe by default even if Resend is never
// configured there.
export function isEmailUnconfigured(): boolean {
  if (smtp || resend) return false;
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.SHOW_DEV_OTP === "true";
}
