import { z } from "zod";
import { localPhoneSchema, strongPassword } from "@/lib/validations/auth";

export const adminLoginSchema = z.object({
  phone: localPhoneSchema,
  password: z.string().min(1, "Enter your password"),
});

export const changeAdminPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: strongPassword,
});

export const recoverAdminSchema = z.object({
  phone: localPhoneSchema,
  envPassword: z.string().min(1, "Enter the server recovery password"),
  newPassword: strongPassword,
  newPhone: localPhoneSchema.optional().or(z.literal("")),
});

export const createFacilitySchema = z.object({
  name: z.string().min(2, "Enter a facility name"),
  type: z.enum(["CHPS", "DISTRICT_HOSPITAL", "TEACHING_HOSPITAL"]),
  region: z.string().min(2, "Enter a region"),
  district: z.string().min(2, "Enter a district"),
  phone: z.string().optional(),
  openedAt: z.string().optional(),
});

export const updateFacilitySchema = z.object({
  name: z.string().min(2).optional(),
  type: z.enum(["CHPS", "DISTRICT_HOSPITAL", "TEACHING_HOSPITAL"]).optional(),
  region: z.string().min(2).optional(),
  district: z.string().min(2).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  openedAt: z.string().optional(),
});

export const createFacilityAdminSchema = z.object({
  name: z.string().min(2, "Enter a full name"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: localPhoneSchema,
  facilityId: z.string().min(1, "Select a facility"),
});

export const updateFacilityAdminSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal("")),
  facilityId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const updateAdminProfileSchema = z.object({
  name: z.string().min(2, "Enter a full name").optional(),
  orgName: z.string().min(2, "Enter an organisation name").optional(),
  district: z.string().min(2, "Enter a district").optional(),
  region: z.string().min(2, "Enter a region").optional(),
});

export const activateAdminRequestSchema = z.object({
  phone: localPhoneSchema,
});

export const activateAdminConfirmSchema = z.object({
  phone: localPhoneSchema,
  otp: z.string().length(6),
  password: strongPassword,
});

// facilityId is deliberately absent — a Facility Admin can only ever create
// staff at their own facility, derived from their session, not a client-
// supplied value. Reassigning staff between facilities is a Platform Admin
// concern, out of scope for a facility-scoped account.
export const createStaffSchema = z.object({
  name: z.string().min(2, "Enter a full name"),
  phone: localPhoneSchema,
  role: z.enum(["MIDWIFE", "DOCTOR"]),
  licenseNumber: z.string().optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
  licenseNumber: z.string().nullable().optional(),
});
