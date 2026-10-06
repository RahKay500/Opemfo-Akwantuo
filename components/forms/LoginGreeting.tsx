"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getLastRole, type LastRole } from "@/lib/last-role";
import { PersonIcon, MidwifeIcon, DoctorIcon, LabIcon, PartnerIcon } from "@/components/ui/icons";

const ROLE_LABEL: Record<LastRole, string> = {
  MOTHER: "Ɔpemfoɔ",
  MIDWIFE: "Midwife",
  DOCTOR: "Doc",
  LAB_TECHNICIAN: "Lab Tech",
  PARTNER: "Partner",
};

export default function LoginGreeting() {
  const [lastRole, setLastRoleState] = useState<LastRole | null>(null);

  useEffect(() => {
    setLastRoleState(getLastRole());
  }, []);

  return (
    <div className="flex flex-col items-start">
      <div className="flex size-14 items-center justify-center rounded-[28px] bg-lilac-light">
        {lastRole === "MOTHER" && <Image src="/images/logo.png" alt="" width={28} height={28} />}
        {lastRole === "MIDWIFE" && <MidwifeIcon className="size-7 text-lilac-dark" />}
        {lastRole === "DOCTOR" && <DoctorIcon className="size-7 text-[#EA580C]" />}
        {lastRole === "LAB_TECHNICIAN" && <LabIcon className="size-7 text-[#0891B2]" />}
        {lastRole === "PARTNER" && <PartnerIcon className="size-7 text-pink-deep" />}
        {!lastRole && <PersonIcon className="size-7 text-lilac-deeper" />}
      </div>

      <h1 className="mt-5 font-heading text-[28px] font-bold leading-tight text-text-primary">
        {lastRole ? `Welcome back, ${ROLE_LABEL[lastRole]}` : "Welcome"}
      </h1>
      <p className="mt-1 font-body text-[15px] text-text-secondary">Sign in to continue</p>
    </div>
  );
}
