"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function LogoutButton({ variant = "badge" }: { variant?: "badge" | "row" | "card" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="flex h-14 w-full items-center justify-center border-b border-border-color font-body text-sm text-[#DC2626] disabled:opacity-60"
      >
        {loading ? "Signing out…" : "Sign Out"}
      </button>
    );
  }

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="flex h-16 w-full items-center justify-center rounded-card bg-critical-bg font-heading text-base font-bold text-critical disabled:opacity-60"
      >
        {loading ? "Signing out…" : "Sign out"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={cn("rounded-badge border border-border-color px-3 py-1.5 font-body text-xs font-medium text-pink-deep disabled:opacity-60")}
    >
      {loading ? "Logging out…" : "Log out"}
    </button>
  );
}
