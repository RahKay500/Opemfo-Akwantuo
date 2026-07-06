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
});

export const createFacilitySchema = z.object({
  name: z.string().min(2, "Enter a facility name"),
  type: z.enum(["CHPS", "DISTRICT_HOSPITAL", "TEACHING_HOSPITAL"]),
  region: z.string().min(2, "Enter a region"),
  district: z.string().min(2, "Enter a district"),
  phone: z.string().optional(),
});

export const updateFacilitySchema = z.object({
  name: z.string().min(2).optional(),
  type: z.enum(["CHPS", "DISTRICT_HOSPITAL", "TEACHING_HOSPITAL"]).optional(),
  region: z.string().min(2).optional(),
  district: z.string().min(2).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createStaffSchema = z.object({
  name: z.string().min(2, "Enter a full name"),
  phone: localPhoneSchema,
  role: z.enum(["MIDWIFE", "DOCTOR"]),
  facilityId: z.string().min(1, "Select a facility"),
  licenseNumber: z.string().optional(),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).optional(),
  facilityId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  licenseNumber: z.string().optional(),
});
