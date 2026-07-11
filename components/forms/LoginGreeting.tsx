"use client";

import { useEffect, useState } from "react";
import { getLastRole, type LastRole } from "@/lib/last-role";

const ROLE_LABEL: Record<LastRole, string> = {
  MOTHER: "Ɔpemfoɔ",
  MIDWIFE: "Midwife/Nurse",
  DOCTOR: "Doc",
};

export default function LoginGreeting() {
  const [lastRole, setLastRoleState] = useState<LastRole | null>(null);

  useEffect(() => {
    setLastRoleState(getLastRole());
  }, []);

  return (
    <>
      <h1 className="mt-5 font-heading text-[28px] font-bold text-text-primary">
        {lastRole ? `Welcome back, ${ROLE_LABEL[lastRole]}` : "Welcome"}
      </h1>
      <p className="mt-1 font-body text-[15px] text-text-secondary">Sign in to continue</p>
    </>
  );
}
