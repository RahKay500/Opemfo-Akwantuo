import { z } from "zod";
import { normalizeGhanaPhone, stripEmoji } from "@/lib/utils";

// Server-side backstop: the client already strips emoji live, but the API
// can be called directly, so this can't rely on that alone.
export const personName = z
  .string()
  .transform((value) => stripEmoji(value).trim())
  .pipe(z.string().min(2, "Enter your full name"));

const ghanaPhone = z
  .string()
  .regex(/^\+233[0-9]{9}$/, "Phone must be in +233XXXXXXXXX format");

// For client-side forms collecting the local "024 123 4567" format rather
// than the API's +233XXXXXXXXX shape. Rejects both too-short and too-long
// input instead of only enforcing a minimum length.
export const localPhoneSchema = z
  .string()
  .min(1, "Enter your phone number")
  .refine((value) => normalizeGhanaPhone(value) !== null, {
    message: "Enter a valid Ghana phone number, e.g. 024 123 4567",
  });

export const loginSchema = z.object({
  phone: ghanaPhone,
  password: z.string().min(8),
});

export const otpSendSchema = z.object({
  phone: ghanaPhone,
});

export const otpVerifySchema = z.object({
  phone: ghanaPhone,
  otp: z.string().length(6),
});

const strongPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const setPasswordSchema = z.object({
  setupToken: z.string().min(1),
  // Optional: omitted when this call is just finalizing a staff registration
  // whose password was already collected and hashed at /api/auth/register.
  password: strongPassword.optional(),
});

export const forgotPasswordSchema = z.object({
  phone: ghanaPhone,
});

export const registerSchema = z.object({
  name: personName,
  phone: ghanaPhone,
  role: z.enum(["MIDWIFE", "DOCTOR"]),
  password: strongPassword,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OtpSendInput = z.infer<typeof otpSendSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
