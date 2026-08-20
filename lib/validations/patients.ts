import { z } from "zod";
import { personName, localPhoneSchema } from "@/lib/validations/auth";

export const createPatientSchema = z.object({
  name: personName,
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phone: localPhoneSchema,
  ghanaCardId: z
    .string()
    .regex(/^GHA-\d{9}-\d$/, "Enter a complete Ghana Card ID")
    .optional()
    .or(z.literal("")),
  lmp: z.string().optional(),
  // Alternative to lmp for mothers with irregular cycles — a scan date +
  // gestational age at that scan, used to back-calculate an effective LMP
  // server-side instead. See app/api/patients/route.ts.
  datingMethod: z.enum(["LMP", "ULTRASOUND"]).optional(),
  scanDate: z.string().optional(),
  gestationalAgeAtScanWeeks: z.number().optional(),
  gestationalAgeAtScanDays: z.number().optional(),
  gravida: z.number().optional(),
  para: z.number().optional(),
  bloodGroup: z.string().optional(),
  knownConditions: z.string().optional(),
  emergencyContactName: personName.optional().or(z.literal("")),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  // Ghana MCH Record Book — Family Identification (page 3)
  community: z.string().optional(),
  nhisNumber: z.string().optional(),
  maritalStatus: z.string().optional(),
  educationalLevel: z.string().optional(),
  occupation: z.string().optional(),
  spouseName: personName.optional().or(z.literal("")),
  spousePhone: z.string().optional(),
  spouseOccupation: z.string().optional(),
  emergencyTransportPhone: z.string().optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
