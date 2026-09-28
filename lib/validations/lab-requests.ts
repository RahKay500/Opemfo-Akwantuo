import { z } from "zod";

// Same preset list already used for Investigations at registration/editing
// (lib/mch-record.ts / InvestigationsStep.tsx), plus "Other" for anything
// ad-hoc — matches this codebase's established Other-field pairing pattern.
export const LAB_TEST_TYPES = [
  "Rh Typing",
  "HBsAg",
  "Sickling",
  "G6PD",
  "VDRL/Syphilis",
  "HIV Antibody",
  "Hb",
  "Urine RE",
  "Stool RE",
  "BF for Malaria",
  "Other",
] as const;

export const createLabRequestSchema = z.object({
  patientId: z.string().min(1),
  testType: z.string().min(1, "Choose a test type"),
  notes: z.string().optional(),
});

export type CreateLabRequestInput = z.infer<typeof createLabRequestSchema>;

export const updateLabRequestStatusSchema = z.object({
  status: z.enum(["IN_PROGRESS", "READY", "CANCELLED"]),
  eta: z.string().optional(),
  result: z.string().optional(),
  isAbnormal: z.boolean().optional(),
});

export type UpdateLabRequestStatusInput = z.infer<typeof updateLabRequestStatusSchema>;
