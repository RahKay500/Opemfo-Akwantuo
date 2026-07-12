import { z } from "zod";
import { personName } from "@/lib/validations/auth";

export const updateProfileSchema = z.object({
  name: personName,
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  bloodGroup: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updatePreferencesSchema = z.object({
  notifyAppointments: z.boolean(),
  notifyReferralUpdates: z.boolean(),
  notifyEducationalContent: z.boolean(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
