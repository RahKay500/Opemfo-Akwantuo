"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutIcon } from "@/components/ui/icons";

export default function AdminSignOutButton() {
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

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm font-medium text-[#DC2626] hover:bg-[#F8FAFC] disabled:opacity-60"
    >
      <LogoutIcon className="size-4" />
      {signingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
