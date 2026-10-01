// Shared notification type -> icon/color/label mapping, used by the staff
// notifications screens (Midwife/Doctor/Lab Technician). Mirrors the shape
// already hand-rolled in app/mother/notifications/NotificationsClient.tsx —
// kept as a separate module rather than refactoring that already-shipped,
// verified screen to import from here, to avoid any regression risk there.
import {
  CheckIcon,
  CalendarIcon,
  AlertTriangleIcon,
  MessageIcon,
  BellIcon,
  LabIcon,
  ShareIcon,
  FlagIcon,
} from "@/components/ui/icons";

export interface NotificationTypeMeta {
  bg: string;
  color: string;
  Icon: typeof CheckIcon;
  label: string;
}

export const NOTIFICATION_TYPE_META: Record<string, NotificationTypeMeta> = {
  REFERRAL: { bg: "bg-lilac-light", color: "text-lilac-deeper", Icon: CheckIcon, label: "Referral" },
  APPOINTMENT: { bg: "bg-lilac-light", color: "text-lilac-deeper", Icon: CalendarIcon, label: "Appointments" },
  VITALS: { bg: "bg-high-bg", color: "text-high", Icon: AlertTriangleIcon, label: "Vitals" },
  LAB_RESULT: { bg: "bg-lilac-light", color: "text-lilac-deeper", Icon: LabIcon, label: "Lab Results" },
  LAB_REQUEST: { bg: "bg-lilac-light", color: "text-lilac-deeper", Icon: LabIcon, label: "Lab Requests" },
  ANNOUNCEMENT: { bg: "bg-lilac-light", color: "text-lilac-deeper", Icon: BellIcon, label: "Announcements" },
  RECORD_SHARE: { bg: "bg-lilac-light", color: "text-lilac-deeper", Icon: ShareIcon, label: "Record Shares" },
  EMERGENCY: { bg: "bg-critical-bg", color: "text-critical", Icon: AlertTriangleIcon, label: "Emergency" },
  SYMPTOM: { bg: "bg-high-bg", color: "text-high", Icon: FlagIcon, label: "Symptoms" },
};

const DEFAULT_META: NotificationTypeMeta = {
  bg: "bg-pink-light",
  color: "text-pink-deep",
  Icon: MessageIcon,
  label: "Other",
};

export function styleFor(type: string): NotificationTypeMeta {
  return NOTIFICATION_TYPE_META[type] ?? DEFAULT_META;
}
