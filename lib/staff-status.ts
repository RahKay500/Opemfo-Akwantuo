export type StaffStatus = "Active" | "Pending" | "Inactive";

// isActive alone can't distinguish "never activated" from "was active, then
// deactivated" — passwordHash tells them apart (set only once the mobile
// app's set-password step has run at least once).
export function deriveStaffStatus(isActive: boolean, hasPassword: boolean): StaffStatus {
  if (isActive) return "Active";
  return hasPassword ? "Inactive" : "Pending";
}
