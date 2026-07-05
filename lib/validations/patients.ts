import { z } from "zod";
import { personName, localPhoneSchema } from "@/lib/validations/auth";

export const createPatientSchema = z.object({
  name: personName,
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phone: localPhoneSchema,
  ghanaCardId: z.string().optional(),
  lmp: z.string().optional(),
  gravida: z.number().optional(),
  para: z.number().optional(),
  bloodGroup: z.string().optional(),
  knownConditions: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
