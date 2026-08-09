import type { ComponentType, SVGProps } from "react";
import {
  NavHomeIcon,
  NavFacilitiesIcon,
  NavShieldUserIcon,
  NavPatientsIcon,
  NavAuditLogIcon,
  NavReferralsIcon,
  AlertTriangleIcon,
  BellIcon,
} from "@/components/ui/icons";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

// facilityId null = Platform Super Admin (manages facilities + facility
// admin accounts, never staff directly); set = a Facility Admin, scoped to
// managing only their own facility's staff.
export function getAdminNavItems(facilityId: string | null): AdminNavItem[] {
  if (facilityId === null) {
    return [
      { href: "/admin/dashboard", label: "Dashboard", icon: NavHomeIcon },
      { href: "/admin/facilities", label: "Facilities", icon: NavFacilitiesIcon },
      { href: "/admin/facility-admins", label: "Facility Admins", icon: NavShieldUserIcon },
      { href: "/admin/staff-directory", label: "Staff", icon: NavShieldUserIcon },
      { href: "/admin/patients", label: "Patients", icon: NavPatientsIcon },
      { href: "/admin/referrals", label: "Referrals", icon: NavReferralsIcon },
      { href: "/admin/alerts", label: "Emergency Alerts", icon: AlertTriangleIcon },
      { href: "/admin/broadcast", label: "Broadcast", icon: BellIcon },
      { href: "/admin/audit", label: "Audit Log", icon: NavAuditLogIcon },
    ];
  }
  return [
    { href: "/admin/dashboard", label: "Dashboard", icon: NavHomeIcon },
    { href: "/admin/staff", label: "Staff", icon: NavShieldUserIcon },
    { href: "/admin/patients", label: "Patients", icon: NavPatientsIcon },
    { href: "/admin/audit", label: "Audit Log", icon: NavAuditLogIcon },
  ];
}
