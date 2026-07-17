import { z } from "zod";
import { personName } from "@/lib/validations/auth";

// Staff ID / Medical Licence No. (User.licenseNumber) is deliberately not
// editable here — it's the one field a facility administrator sets at
// provisioning for a future verification step, and the "GHS Verified" badge
// on Profile only means something if staff can't just self-assert it.
export const updateStaffProfileSchema = z.object({
  name: personName,
  dateOfBirth: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  serviceStartDate: z.string().optional(),
  specialty: z.string().optional(),
});

export type UpdateStaffProfileInput = z.infer<typeof updateStaffProfileSchema>;
