import { z } from "zod";
import { localPhoneSchema, strongPassword, personName } from "@/lib/validations/auth";

export const adminLoginSchema = z.object({
  identifier: z.string().min(1, "Enter your email or phone number"),
  password: z.string().min(1, "Enter your password"),
});

export const changeAdminPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: strongPassword,
});

export const recoverAdminSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  envPassword: z.string().min(1, "Enter the server recovery password"),
  newPassword: strongPassword,
  newEmail: z.string().email().optional().or(z.literal("")),
});

export const createFacilitySchema = z.object({
  name: z.string().min(2, "Enter a facility name"),
  type: z.enum(["CHPS", "HEALTH_CENTRE", "DISTRICT_HOSPITAL", "REGIONAL_HOSPITAL", "TEACHING_HOSPITAL"]),
  districtId: z.string().min(1, "Select a district"),
  phone: z.string().optional(),
  openedAt: z.string().optional(),
});

export const updateFacilitySchema = z.object({
  name: z.string().min(2).optional(),
  type: z.enum(["CHPS", "HEALTH_CENTRE", "DISTRICT_HOSPITAL", "REGIONAL_HOSPITAL", "TEACHING_HOSPITAL"]).optional(),
  districtId: z.string().min(1).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  openedAt: z.string().optional(),
});

export const createFacilityAdminSchema = z.object({
  name: personName,
  email: z.string().email("Enter a valid email address"),
  phone: localPhoneSchema.optional().or(z.literal("")),
  facilityId: z.string().min(1, "Select a facility"),
});

export const updateFacilityAdminSchema = z.object({
  name: personName.optional(),
  email: z.string().email().optional().or(z.literal("")),
  facilityId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

// regionId is optional and only ever honored for the Platform Super Admin
// tier — a Regional Admin can only ever create District Admins within their
// own region, derived from their session; the route ignores this field
// entirely for that tier rather than letting a client-supplied value
// override it (same convention as createStaffSchema's facilityId below).
export const createDistrictAdminSchema = z.object({
  name: personName,
  email: z.string().email("Enter a valid email address"),
  phone: localPhoneSchema.optional().or(z.literal("")),
  regionId: z.string().optional(),
  districtId: z.string().min(1, "Select a district"),
});

export const updateDistrictAdminSchema = z.object({
  name: personName.optional(),
  email: z.string().email().optional().or(z.literal("")),
  districtId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const createRegionalAdminSchema = z.object({
  name: personName,
  email: z.string().email("Enter a valid email address"),
  phone: localPhoneSchema.optional().or(z.literal("")),
  regionId: z.string().min(1, "Select a region"),
});

export const updateRegionalAdminSchema = z.object({
  name: personName.optional(),
  email: z.string().email().optional().or(z.literal("")),
  regionId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const updateAdminProfileSchema = z.object({
  name: personName.optional(),
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

// One-step activation via the emailed link's token — no separate OTP entry,
// since receiving the link is itself the proof of identity.
export const activateAdminLinkSchema = z.object({
  token: z.string().min(1, "Missing activation token"),
  password: strongPassword,
});

// facilityId is optional and only ever honored for the Platform Super Admin
// tier — a Facility Admin can only ever create staff at their own facility,
// derived from their session; the route ignores this field entirely for
// that tier rather than letting a client-supplied value override it.
export const createStaffSchema = z.object({
  name: personName,
  email: z.string().email("Enter a valid email address"),
  phone: localPhoneSchema.optional().or(z.literal("")),
  role: z.enum(["MIDWIFE", "DOCTOR", "LAB_TECHNICIAN"]),
  licenseNumber: z.string().optional(),
  facilityId: z.string().optional(),
});

export const updateStaffSchema = z.object({
  name: personName.optional(),
  isActive: z.boolean().optional(),
  licenseNumber: z.string().nullable().optional(),
});

export const broadcastSchema = z.object({
  title: z.string().min(2, "Enter a title"),
  message: z.string().min(2, "Enter a message"),
  // Who receives it. ADMINS (the original behaviour) reaches Facility
  // Admins via AdminNotification; STAFF/MOTHERS reach real staff/mother
  // accounts via the generic Notification model — see the route for why
  // these are two different delivery paths.
  audience: z.enum(["ADMINS", "STAFF", "MOTHERS"]).default("ADMINS"),
  // Geographic narrowing. ALL is every recipient in the audience;
  // REGION/DISTRICT/FACILITY require the matching id below.
  scope: z.enum(["ALL", "REGION", "DISTRICT", "FACILITY"]).default("ALL"),
  regionId: z.string().optional(),
  districtId: z.string().optional(),
  facilityId: z.string().optional(),
  // Only meaningful when audience is STAFF — which staff roles to include.
  // Empty/omitted means all three.
  roles: z.array(z.enum(["MIDWIFE", "DOCTOR", "LAB_TECHNICIAN"])).optional(),
});
