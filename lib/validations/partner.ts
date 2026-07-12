import { z } from "zod";

export const createPartnerLinkSchema = z.object({
  partnerName: z.string().trim().min(1, "Enter your partner's name"),
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
