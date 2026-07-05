"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { normalizeGhanaPhone } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";

const formSchema = z.object({
  phone: z.string().min(9, "Enter your phone number"),
  password: z.string().min(1, "Enter your password"),
});

type FormValues = z.infer<typeof formSchema>;

const ROLE_HOME: Record<string, string> = {
  MOTHER: "/mother/dashboard",
  MIDWIFE: "/midwife/dashboard",
  DOCTOR: "/doctor/dashboard",
};

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    const phone = normalizeGhanaPhone(values.phone);
    if (!phone) {
      setServerError("Enter a valid Ghana phone number, e.g. 024 123 4567.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password: values.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push(ROLE_HOME[data.user.role] ?? "/login");
      router.refresh();
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4">
      <div>
        <label className="mb-1.5 block font-body text-[13px] font-medium text-text-secondary">
          Phone number
        </label>
        <input
          type="tel"
          placeholder="024 123 4567"
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
            placeholder="••••••••"
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
        {errors.password && <p className="mt-1 text-xs text-[#DC2626]">{errors.password.message}</p>}
        <div className="mt-2 flex justify-end">
          <Link href="/forgot-password" className="font-body text-[13px] font-medium text-pink-deep">
            Forgot password?
          </Link>
        </div>
      </div>

      {serverError && (
        <p className="rounded-input bg-[#FEF2F2] px-3 py-2 text-sm text-[#DC2626]">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 h-14 rounded-button bg-primary font-heading text-[17px] font-bold text-lilac-deeper disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>

      <p className="text-center font-body text-sm text-text-secondary">
        Don&apos;t have an account?{" "}
        <Link href="/create-account" className="font-medium text-pink-deep">
          Create one
        </Link>
      </p>
    </form>
  );
}
