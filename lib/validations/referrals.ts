import { z } from "zod";

export const createReferralSchema = z
  .object({
    patientId: z.string().min(1),
    toFacilityId: z.string().optional(),
    externalHospitalName: z.string().optional(),
    externalHospitalPhone: z.string().optional(),
    priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
    systemSuggestedPriority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
    nurseOverrideReason: z.string().optional(),
    reason: z.string().min(1, "Describe the reason for this referral"),
    additionalNotes: z.string().optional(),
    transportMethod: z.string().optional(),
    includeHistory: z.boolean().default(true),
    includeVitals: z.boolean().default(true),
    includeFlags: z.boolean().default(true),
  })
  .refine((data) => data.toFacilityId || data.externalHospitalName?.trim(), {
    message: "Choose a facility or enter the external hospital's name",
    path: ["toFacilityId"],
  });

export type CreateReferralInput = z.infer<typeof createReferralSchema>;

export const updateReferralStatusSchema = z.object({
  status: z.enum(["ACKNOWLEDGED", "PATIENT_ARRIVED", "COMPLETED", "CANCELLED"]),
  outcomeNotes: z.string().optional(),
});

export type UpdateReferralStatusInput = z.infer<typeof updateReferralStatusSchema>;
