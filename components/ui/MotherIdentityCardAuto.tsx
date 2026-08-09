"use client";

import { useEffect, useState } from "react";
import MotherIdentityCard from "@/components/ui/MotherIdentityCard";

// For client-component pages (Symptoms, Book a Visit) that have no
// server-side data fetch of their own — self-fetches instead of taking
// props, mirroring the pattern already used by NotificationBell (Admin).
export default function MotherIdentityCardAuto() {
  const [identity, setIdentity] = useState<{ name: string; week: number | null; dueDate: string | null } | null>(
    null
  );

  useEffect(() => {
    fetch("/api/mother/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.name) setIdentity({ name: data.name, week: data.week, dueDate: data.dueDate });
      })
      .catch(() => {});
  }, []);

  if (!identity) return null;

  return <MotherIdentityCard name={identity.name} week={identity.week} dueDate={identity.dueDate} />;
}
