export interface AdminNavItem {
  href: string;
  label: string;
}

// facilityId null = Platform Super Admin (manages facilities + facility
// admin accounts, never staff directly); set = a Facility Admin, scoped to
// managing only their own facility's staff.
export function getAdminNavItems(facilityId: string | null): AdminNavItem[] {
  if (facilityId === null) {
    return [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/facilities", label: "Facilities" },
      { href: "/admin/facility-admins", label: "Facility Admins" },
      { href: "/admin/audit", label: "Audit Log" },
      { href: "/admin/settings", label: "Settings" },
    ];
  }
  return [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/staff", label: "Staff" },
    { href: "/admin/patients", label: "Patients" },
    { href: "/admin/audit", label: "Audit Log" },
    { href: "/admin/settings", label: "Settings" },
  ];
}
