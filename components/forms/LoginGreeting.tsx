"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getLastRole, type LastRole } from "@/lib/last-role";
import { PersonIcon, MidwifeIcon, DoctorIcon } from "@/components/ui/icons";

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
      <div className="flex size-[72px] items-center justify-center rounded-[36px] bg-lilac-light">
        {lastRole === "MOTHER" && <Image src="/images/logo.png" alt="" width={32} height={32} />}
        {lastRole === "MIDWIFE" && <MidwifeIcon className="size-9 text-lilac-dark" />}
        {lastRole === "DOCTOR" && <DoctorIcon className="size-9 text-[#EA580C]" />}
        {!lastRole && <PersonIcon className="size-9 text-lilac-deeper" />}
      </div>

      <h1 className="mt-5 font-heading text-[28px] font-bold text-text-primary">
        {lastRole ? `Welcome back, ${ROLE_LABEL[lastRole]}` : "Welcome"}
      </h1>
      <p className="mt-1 font-body text-[15px] text-text-secondary">Sign in to continue</p>
    </>
  );
}
