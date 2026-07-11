import { z } from "zod";

export const logVaccinationSchema = z.object({
  category: z.enum(["TD", "IPTP", "DEWORMING"]),
  doseNumber: z.number().int().min(1),
  dateGiven: z.string().min(1),
  batchNumber: z.string().optional(),
  gestationalAge: z.number().int().optional(),
});

export type LogVaccinationInput = z.infer<typeof logVaccinationSchema>;
