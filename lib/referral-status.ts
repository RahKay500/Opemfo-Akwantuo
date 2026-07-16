import type { ReferralStatus } from "@prisma/client";

// Same ReferralStatus enum as the sending (midwife) side, relabeled from the
// receiving hospital's point of view: a referral that's merely SENT hasn't
// been looked at yet ("Awaiting"), ACKNOWLEDGED means a doctor has opened it
// ("In Review"), and PATIENT_ARRIVED/COMPLETED both read as "Accepted" here.
export const DOCTOR_REFERRAL_STATUS: Record<ReferralStatus, { bg: string; text: string; label: string }> = {
  SENT: { bg: "bg-medium-bg", text: "text-medium", label: "Awaiting" },
  ACKNOWLEDGED: { bg: "bg-lilac-light", text: "text-lilac-deeper", label: "In Review" },
  PATIENT_ARRIVED: { bg: "bg-low-bg", text: "text-low", label: "Accepted" },
  COMPLETED: { bg: "bg-low-bg", text: "text-low", label: "Accepted" },
  CANCELLED: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", label: "Cancelled" },
};
