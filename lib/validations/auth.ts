import { z } from "zod";

const ghanaPhone = z
  .string()
  .regex(/^\+233[0-9]{9}$/, "Phone must be in +233XXXXXXXXX format");

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

export const setPasswordSchema = z.object({
  setupToken: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OtpSendInput = z.infer<typeof otpSendSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
