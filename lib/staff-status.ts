export type StaffStatus = "Active" | "Pending" | "Inactive";

// isActive alone can't distinguish "never activated" from "was active, then
// deactivated" — passwordHash tells them apart (set only once the mobile
// app's set-password step has run at least once).
export function deriveStaffStatus(isActive: boolean, hasPassword: boolean): StaffStatus {
  if (isActive) return "Active";
  return hasPassword ? "Inactive" : "Pending";
}

export type FacilityStatus = "Active" | "Low Staff" | "Inactive";

// A facility with fewer than 2 staff can't reliably cover shifts — flagged
// as a distinct warning state layered on top of Active, not a separate
// isActive value.
const LOW_STAFF_THRESHOLD = 2;

export function deriveFacilityStatus(isActive: boolean, staffCount: number): FacilityStatus {
  if (!isActive) return "Inactive";
  return staffCount < LOW_STAFF_THRESHOLD ? "Low Staff" : "Active";
}
