"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSignOutButton({ variant = "sidebar" }: { variant?: "sidebar" | "row" }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="flex h-14 w-full items-center justify-center text-sm font-medium text-[#DC2626] disabled:opacity-60"
      >
        {signingOut ? "Signing out…" : "Sign Out"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className="w-full rounded-md px-4 py-2.5 text-left text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-60"
    >
      {signingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
