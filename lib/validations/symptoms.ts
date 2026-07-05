import { z } from "zod";

export const symptomSchema = z
  .object({
    symptoms: z.array(z.string()).default([]),
    severity: z.enum(["MILD", "MODERATE", "SEVERE"]),
    notes: z.string().optional(),
    startedWhen: z.string().optional(),
  })
  .refine((data) => data.symptoms.length > 0 || Boolean(data.notes?.trim()), {
    message: "Select at least one symptom or describe how you're feeling.",
    path: ["symptoms"],
  });

export type SymptomInput = z.infer<typeof symptomSchema>;
