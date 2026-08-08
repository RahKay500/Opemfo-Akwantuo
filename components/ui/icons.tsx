// Icon set — Foundations batch, Icons section. Every icon here wraps a glyph
// from the Figma design system's icon library (Hugeicons, Stroke Rounded
// free set) via @hugeicons/react, instead of the hand-copied Figma paths
// this file used to hold. Function names/signatures are unchanged so every
// existing call site (`<HeartIcon className="size-10 text-primary" />`)
// keeps working without edits — same pattern as the color/font Foundations
// swap. Hugeicons' free tier is stroke-only, so icons that were previously
// solid fills (HeartIcon, PlayIcon) now render as outlines too, which is
// consistent with the rest of the system rather than a regression.
import type { SVGProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  HeartIcon as HugeHeartIcon,
  UserIcon,
  UserMultiple02Icon,
  Stethoscope02Icon,
  Doctor01Icon,
  Message01Icon,
  LockIcon as HugeLockIcon,
  ViewIcon,
  ViewOffIcon,
  Tick02Icon,
  ArrowLeft01Icon,
  Notification01Icon,
  BloodPressureIcon,
  Calendar03Icon,
  HeartPulseIcon,
  ChevronRightIcon as HugeChevronRightIcon,
  Home01Icon,
  File01Icon,
  SentIcon,
  AlertCircleIcon,
  Analytics01Icon,
  Alert02Icon,
  PlayIcon as HugePlayIcon,
  CallOutgoing02Icon,
  Search01Icon,
  Share08Icon,
  ArrowUpRight02Icon,
  Flag02Icon,
  PlusSignIcon,
  ArrowDataTransferHorizontalIcon,
  Edit02Icon,
  Location01Icon,
  SecurityCheckIcon,
  Cancel01Icon,
  Notification03Icon,
  PauseIcon as HugePauseIcon,
  VolumeHighIcon as HugeVolumeHighIcon,
  VolumeMuteIcon as HugeVolumeMuteIcon,
  Maximize01Icon as HugeMaximize01Icon,
  Minimize01Icon as HugeMinimize01Icon,
  MoreVerticalIcon as HugeMoreVerticalIcon,
  HelpCircleIcon as HugeHelpCircleIcon,
  CheckmarkCircle02Icon as HugeCheckmarkCircle02Icon,
  ArrowUpRightIcon as HugeArrowUpRightIcon,
  ArrowRight01Icon as HugeArrowRight01Icon,
  InformationCircleIcon as HugeInformationCircleIcon,
} from "@hugeicons/core-free-icons";

function makeIcon(glyph: IconSvgElement) {
  return function Icon(props: SVGProps<SVGSVGElement>) {
    // SVGProps' strokeWidth is string | number; HugeiconsIcon narrows it to
    // number. No call site sets strokeWidth today, so this cast is safe.
    return <HugeiconsIcon icon={glyph} {...(props as Omit<typeof props, "strokeWidth">)} />;
  };
}

export const HeartIcon = makeIcon(HugeHeartIcon);
export const PersonIcon = makeIcon(UserIcon);
// CreateAccountScreen's header icon — a family/household cluster.
export const FamilyIcon = makeIcon(UserMultiple02Icon);
// Midwife role card icon.
export const MidwifeIcon = makeIcon(Stethoscope02Icon);
// Doctor role card icon.
export const DoctorIcon = makeIcon(Doctor01Icon);
export const MessageIcon = makeIcon(Message01Icon);
export const LockIcon = makeIcon(HugeLockIcon);
export const EyeIcon = makeIcon(ViewIcon);
export const EyeOffIcon = makeIcon(ViewOffIcon);
export const CheckIcon = makeIcon(Tick02Icon);
export const ArrowLeftIcon = makeIcon(ArrowLeft01Icon);
export const BellIcon = makeIcon(Notification01Icon);
export const BPIcon = makeIcon(BloodPressureIcon);
export const CalendarIcon = makeIcon(Calendar03Icon);
export const HeartRateIcon = makeIcon(HeartPulseIcon);
export const PartnerIcon = makeIcon(HugeHeartIcon);
export const ChevronRightIcon = makeIcon(HugeChevronRightIcon);
export const NavHomeIcon = makeIcon(Home01Icon);
export const NavRecordsIcon = makeIcon(File01Icon);
export const NavReferralIcon = makeIcon(SentIcon);
export const NavAlertsIcon = makeIcon(AlertCircleIcon);
export const NavProfileIcon = makeIcon(UserIcon);
export const AnalyticsIcon = makeIcon(Analytics01Icon);
export const AlertTriangleIcon = makeIcon(Alert02Icon);
export const PlayIcon = makeIcon(HugePlayIcon);
export const PhoneCallIcon = makeIcon(CallOutgoing02Icon);
export const SearchIcon = makeIcon(Search01Icon);
export const ShareIcon = makeIcon(Share08Icon);
export const PatientsIcon = makeIcon(UserMultiple02Icon);
export const ReferralArrowIcon = makeIcon(ArrowUpRight02Icon);
export const FlagIcon = makeIcon(Flag02Icon);
export const ClockIcon = makeIcon(Calendar03Icon);
export const PlusIcon = makeIcon(PlusSignIcon);
export const NavPatientsIcon = makeIcon(UserMultiple02Icon);
export const NavReferralsIcon = makeIcon(ArrowDataTransferHorizontalIcon);
export const PencilIcon = makeIcon(Edit02Icon);
export const LocationPinIcon = makeIcon(Location01Icon);
export const ShieldCheckIcon = makeIcon(SecurityCheckIcon);
export const XIcon = makeIcon(Cancel01Icon);
export const EmergencyBellIcon = makeIcon(Notification03Icon);
export const PauseIcon = makeIcon(HugePauseIcon);
export const VolumeHighIcon = makeIcon(HugeVolumeHighIcon);
export const VolumeMuteIcon = makeIcon(HugeVolumeMuteIcon);
export const Maximize01Icon = makeIcon(HugeMaximize01Icon);
export const Minimize01Icon = makeIcon(HugeMinimize01Icon);
export const DotsVerticalIcon = makeIcon(HugeMoreVerticalIcon);
export const HelpCircleIcon = makeIcon(HugeHelpCircleIcon);
export const CheckCircleIcon = makeIcon(HugeCheckmarkCircle02Icon);
export const ArrowUpRightIcon = makeIcon(HugeArrowUpRightIcon);
export const ArrowRightIcon = makeIcon(HugeArrowRight01Icon);
export const InfoIcon = makeIcon(HugeInformationCircleIcon);
