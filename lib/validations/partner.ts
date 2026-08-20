import { z } from "zod";
import { personName } from "@/lib/validations/auth";

export const createPartnerLinkSchema = z.object({
  partnerName: personName,
  partnerPhone: z.string().trim().min(1, "Enter your partner's phone number"),
  sendVia: z.enum(["sms", "link"]),
  shareProgress: z.boolean(),
  shareAppointments: z.boolean(),
  shareVitals: z.boolean(),
  shareVisitSummaries: z.boolean(),
  shareReferralStatus: z.boolean(),
  shareMedicalHistory: z.boolean(),
});

export type CreatePartnerLinkInput = z.infer<typeof createPartnerLinkSchema>;
