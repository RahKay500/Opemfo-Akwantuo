import { z } from "zod";

const urineTestResult = z.enum(["NEGATIVE", "TRACE", "PLUS_1", "PLUS_2", "PLUS_3"]);
const fetalPresentation = z.enum(["CEPHALIC", "BREECH", "OTHER"]);

export const logVisitSchema = z.object({
  visitType: z.enum(["ANTENATAL", "POSTNATAL"]),
  systolic: z.number().optional(),
  diastolic: z.number().optional(),
  fetalHeartRate: z.number().optional(),
  temperature: z.number().optional(),
  weight: z.number().optional(),
  fundalHeight: z.number().optional(),
  observations: z.string().optional(),
  nextVisitDate: z.coerce.date().optional(),
  // Ghana MCH Record Book — Antenatal Follow-Up table (page 7)
  urineProt: urineTestResult.optional(),
  urineSugar: urineTestResult.optional(),
  oedema: z.boolean().optional(),
  fetalPresentation: fetalPresentation.optional(),
  fetalDescent: z.string().optional(),
  ifaSupplied: z.number().optional(),
  complaints: z.string().optional(),
});

export type LogVisitInput = z.infer<typeof logVisitSchema>;
