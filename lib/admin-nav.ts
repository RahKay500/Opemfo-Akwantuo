import type { ComponentType, SVGProps } from "react";
import type { AdminScope } from "@/lib/admin-auth";
import { isPlatformAdmin } from "@/lib/admin-auth";
import {
  NavHomeIcon,
  NavFacilitiesIcon,
  NavShieldUserIcon,
  NavPatientsIcon,
  NavAuditLogIcon,
  NavReferralsIcon,
  AlertTriangleIcon,
  BellIcon,
  NavVideosIcon,
} from "@/components/ui/icons";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

// Tier is inferred the same way the rest of the admin portal infers it — see
// isPlatformAdmin's own comment for why facilityId alone stopped being
// enough once Regional/District Admin existed.
export function getAdminNavItems(scope: AdminScope): AdminNavItem[] {
  if (isPlatformAdmin(scope)) {
    return [
      { href: "/admin/dashboard", label: "Dashboard", icon: NavHomeIcon },
      { href: "/admin/facilities", label: "Facilities", icon: NavFacilitiesIcon },
      { href: "/admin/regional-admins", label: "Regional Admins", icon: NavShieldUserIcon },
      { href: "/admin/district-admins", label: "District Admins", icon: NavShieldUserIcon },
      { href: "/admin/facility-admins", label: "Facility Admins", icon: NavShieldUserIcon },
      { href: "/admin/staff-directory", label: "Staff", icon: NavShieldUserIcon },
      { href: "/admin/patients", label: "Patients", icon: NavPatientsIcon },
      { href: "/admin/referrals", label: "Referrals", icon: NavReferralsIcon },
      { href: "/admin/alerts", label: "Emergency Alerts", icon: AlertTriangleIcon },
      { href: "/admin/broadcast", label: "Broadcast", icon: BellIcon },
      { href: "/admin/videos", label: "Videos", icon: NavVideosIcon },
      { href: "/admin/audit", label: "Audit Log", icon: NavAuditLogIcon },
    ];
  }
  if (scope.regionId !== null) {
    return [
      { href: "/admin/dashboard", label: "Dashboard", icon: NavHomeIcon },
      { href: "/admin/district-admins", label: "District Admins", icon: NavShieldUserIcon },
      { href: "/admin/patients", label: "Patients", icon: NavPatientsIcon },
    ];
  }
  if (scope.districtId !== null) {
    return [
      { href: "/admin/dashboard", label: "Dashboard", icon: NavHomeIcon },
      { href: "/admin/facility-admins", label: "Facility Admins", icon: NavShieldUserIcon },
      { href: "/admin/facilities", label: "Facilities", icon: NavFacilitiesIcon },
      { href: "/admin/patients", label: "Patients", icon: NavPatientsIcon },
    ];
  }
  return [
    { href: "/admin/dashboard", label: "Dashboard", icon: NavHomeIcon },
    { href: "/admin/staff", label: "Staff", icon: NavShieldUserIcon },
    { href: "/admin/patients", label: "Patients", icon: NavPatientsIcon },
    { href: "/admin/videos", label: "Videos", icon: NavVideosIcon },
    { href: "/admin/audit", label: "Audit Log", icon: NavAuditLogIcon },
  ];
}
