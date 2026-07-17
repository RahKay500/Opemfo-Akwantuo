import { z } from "zod";
import { personName } from "@/lib/validations/auth";

export const updateStaffProfileSchema = z.object({
  name: personName,
  staffId: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  serviceStartDate: z.string().optional(),
  specialty: z.string().optional(),
});

export type UpdateStaffProfileInput = z.infer<typeof updateStaffProfileSchema>;
