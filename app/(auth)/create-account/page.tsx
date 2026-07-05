"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { normalizeGhanaPhone, stripEmoji, cn } from "@/lib/utils";
import { localPhoneSchema } from "@/lib/validations/auth";
import { FamilyIcon, MidwifeIcon, DoctorIcon, EyeIcon, EyeOffIcon, CheckIcon } from "@/components/ui/icons";
import PasswordStrength from "@/components/ui/PasswordStrength";

const formSchema = z
  .object({
    role: z.enum(["MIDWIFE", "DOCTOR"], { message: "Choose a role" }),
    name: z.string().min(2, "Enter your full name"),
    phone: localPhoneSchema,
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[0-9]/, "Add a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

const ROLES = [
  {
    value: "MIDWIFE" as const,
    label: "Midwife",
    blurb: "Manage patient care",
    icon: MidwifeIcon,
    // Figma's exact stroke color for this icon — happens to equal our
    // lilac-dark token.
    iconClassName: "text-lilac-dark",
  },
  {
    value: "DOCTOR" as const,
    label: "Doctor",
    blurb: "Review referrals",
    icon: DoctorIcon,
    // Figma's exact stroke color for this icon is #EA580C, which equals our
    // "high" triage token — using the raw hex here since this is a role-card
    // icon, not a priority indicator, and triage classes are reserved for
    // priority indicators only.
    iconClassName: "text-[#EA580C]",
  },
];

export default function CreateAccountPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const role = watch("role");
  const password = watch("password") ?? "";

  async function onSubmit(values: FormValues) {
    setServerError(null);
    // Non-null: localPhoneSchema's refine already confirmed this normalizes.
    const phone = normalizeGhanaPhone(values.phone)!;

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name.trim(), phone, role: values.role, password: values.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      const devOtpParam = data.devOtp ? `&devOtp=${data.devOtp}` : "";
      router.push(`/otp?phone=${encodeURIComponent(data.phone)}&next=account-created${devOtpParam}`);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#F6F1F8] pb-12 pt-11">
      <div className="flex w-full flex-col items-center pt-[60px]">
        <div className="flex size-14 items-center justify-center rounded-[28px] bg-primary">
          <FamilyIcon className="size-8 text-white" />
        </div>
        <h1 className="mt-4 font-heading text-[28px] font-bold text-text-primary">Create your account</h1>
        <p className="mt-1 font-body text-[15px] text-text-secondary">Join Ɔpimfuo to get started</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full px-6 pt-10">
        <p className="mb-3 font-body text-sm font-medium text-text-primary">I am a...</p>
        <div className="mb-4 flex gap-3">
          {ROLES.map(({ value, label, blurb, icon: Icon, iconClassName }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("role", value, { shouldValidate: true })}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-2 rounded-card border-2 p-4 shadow-card",
                role === value ? "border-primary bg-lilac-light" : "border-border-color bg-white"
              )}
            >
              {role === value && (
                <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-badge bg-primary">
                  <CheckIcon className="size-2.5 text-white" />
                </span>
              )}
              <Icon className={cn("size-8", iconClassName)} />
              <span className="font-heading text-[15px] font-bold text-text-primary">{label}</span>
              <span className="text-center font-body text-xs text-text-secondary">{blurb}</span>
            </button>
          ))}
        </div>
        {errors.role && <p className="mb-3 text-xs text-[#DC2626]">{errors.role.message}</p>}

        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block font-body text-[13px] font-medium text-text-secondary">
              Full Name
            </label>
            <input
              placeholder="Enter your full name"
              className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              {...register("name", {
                // Contact-autofill can carry an emoji from how the phone's
                // saved (e.g. "🏥 Efua Mensah") — strip it live so it never
                // reaches a clinical record, whether typed or autofilled.
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  e.target.value = stripEmoji(e.target.value);
                },
              })}
            />
            {errors.name && <p className="mt-1 text-xs text-[#DC2626]">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block font-body text-[13px] font-medium text-text-secondary">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="024 123 4567"
              maxLength={12}
              className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] font-body text-[15px] text-text-primary outline-none focus:border-primary"
              {...register("phone")}
            />
            {errors.phone && <p className="mt-1 text-xs text-[#DC2626]">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block font-body text-[13px] font-medium text-text-secondary">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] pr-12 font-body text-[15px] text-text-primary outline-none focus:border-primary"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon className="size-[18px]" /> : <EyeIcon className="size-[18px]" />}
              </button>
            </div>
            <PasswordStrength password={password} />
            {errors.password && <p className="mt-1 text-xs text-[#DC2626]">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block font-body text-[13px] font-medium text-text-secondary">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter your password"
                className="h-14 w-full rounded-input border-[1.5px] border-border-color bg-white px-[17.5px] pr-12 font-body text-[15px] text-text-primary outline-none focus:border-primary"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOffIcon className="size-[18px]" /> : <EyeIcon className="size-[18px]" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-[#DC2626]">{errors.confirmPassword.message}</p>
            )}
          </div>

          <p className="text-center font-body text-[13px] text-text-secondary">
            By creating an account you agree to our{" "}
            <span className="text-pink-deep underline">Terms &amp; Privacy Policy</span>
          </p>

          {serverError && (
            <p className="rounded-input bg-[#FEF2F2] px-3 py-2 text-sm text-[#DC2626]">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="h-14 rounded-button bg-primary font-heading text-[17px] font-bold text-lilac-deeper disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create Account"}
          </button>

          <p className="text-center font-body text-sm text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-pink-deep">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </main>
  );
}
