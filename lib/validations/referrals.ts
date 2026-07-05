import { z } from "zod";

export const createReferralSchema = z.object({
  patientId: z.string().min(1),
  toFacilityId: z.string().min(1),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  systemSuggestedPriority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  nurseOverrideReason: z.string().optional(),
  reason: z.string().min(1, "Describe the reason for this referral"),
  additionalNotes: z.string().optional(),
  transportMethod: z.string().optional(),
  includeHistory: z.boolean().default(true),
  includeVitals: z.boolean().default(true),
  includeFlags: z.boolean().default(true),
});

export type CreateReferralInput = z.infer<typeof createReferralSchema>;
