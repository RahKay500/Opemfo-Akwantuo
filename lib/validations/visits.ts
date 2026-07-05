import { z } from "zod";

export const logVisitSchema = z.object({
  visitType: z.enum(["ANTENATAL", "POSTNATAL"]),
  systolic: z.number().optional(),
  diastolic: z.number().optional(),
  fetalHeartRate: z.number().optional(),
  temperature: z.number().optional(),
  weight: z.number().optional(),
  fundalHeight: z.number().optional(),
  observations: z.string().optional(),
});

export type LogVisitInput = z.infer<typeof logVisitSchema>;
