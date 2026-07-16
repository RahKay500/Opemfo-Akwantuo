// Icon set for auth screens. Paths pulled directly from the Figma file via
// its Dev Mode MCP server (localhost-only while Figma desktop is open, so
// the raw asset URLs aren't portable — these are the exact vector paths
// copied out, not hand-drawn approximations).
import type { SVGProps } from "react";

export function HeartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M34.7333 7.68333C33.8821 6.83167 32.8714 6.15608 31.7589 5.69514C30.6465 5.2342 29.4541 4.99696 28.25 4.99696C27.0459 4.99696 25.8535 5.2342 24.7411 5.69514C23.6286 6.15608 22.6179 6.83167 21.7667 7.68333L20 9.45L18.2333 7.68333C16.5138 5.96385 14.1817 4.99785 11.75 4.99785C9.31828 4.99785 6.98615 5.96385 5.26667 7.68333C3.54718 9.40282 2.58118 11.7349 2.58118 14.1667C2.58118 16.5984 3.54718 18.9305 5.26667 20.65L7.03333 22.4167L20 35.3833L32.9667 22.4167L34.7333 20.65C35.585 19.7987 36.2606 18.788 36.7215 17.6756C37.1825 16.5632 37.4197 15.3708 37.4197 14.1667C37.4197 12.9625 37.1825 11.7702 36.7215 10.6577C36.2606 9.54531 35.585 8.53459 34.7333 7.68333Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PersonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="8" r="4" fill="currentColor" />
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// CreateAccountScreen's header icon — a family/household cluster, not a
// generic person-plus.
export function FamilyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
        fill="currentColor"
      />
      <path d="M6 15C6 12.5 8.5 11 12 11C15.5 11 18 12.5 18 15L18.5 24H5.5L6 15Z" fill="currentColor" />
      <path
        d="M12 22.5C14.2091 22.5 16 20.933 16 19C16 17.067 14.2091 15.5 12 15.5C9.79086 15.5 8 17.067 8 19C8 20.933 9.79086 22.5 12 22.5Z"
        fill="currentColor"
      />
      <path
        d="M22 12C23.6569 12 25 10.6569 25 9C25 7.34315 23.6569 6 22 6C20.3431 6 19 7.34315 19 9C19 10.6569 20.3431 12 22 12Z"
        fill="currentColor"
      />
      <path d="M19 15C19 13.5 20 12 22 12C24 12 25 13.5 25 15L25.5 20H18.5L19 15Z" fill="currentColor" />
    </svg>
  );
}

// Midwife role card icon — caring/connected-hands motif.
export function MidwifeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="2.66667" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.6667 2.66667V5.33333" />
        <path d="M6.66667 2.66667V5.33333" />
        <path d="M6.66667 4H5.33333C4.62609 4 3.94781 4.28095 3.44771 4.78105C2.94762 5.28115 2.66667 5.95942 2.66667 6.66667V12C2.66667 14.1217 3.50952 16.1566 5.00981 17.6569C6.5101 19.1571 8.54493 20 10.6667 20C12.7884 20 14.8232 19.1571 16.3235 17.6569C17.8238 16.1566 18.6667 14.1217 18.6667 12V6.66667C18.6667 5.95942 18.3857 5.28115 17.8856 4.78105C17.3855 4.28095 16.7072 4 16 4H14.6667" />
        <path d="M10.6667 20C10.6667 22.1217 11.5095 24.1566 13.0098 25.6569C14.5101 27.1571 16.5449 28 18.6667 28C20.7884 28 22.8232 27.1571 24.3235 25.6569C25.8238 24.1566 26.6667 22.1217 26.6667 20V16" />
        <path d="M26.6667 16C28.1394 16 29.3333 14.8061 29.3333 13.3333C29.3333 11.8606 28.1394 10.6667 26.6667 10.6667C25.1939 10.6667 24 11.8606 24 13.3333C24 14.8061 25.1939 16 26.6667 16Z" />
      </g>
    </svg>
  );
}

// Doctor role card icon — medical cross. Figma's own default color for this
// is #EA580C, which happens to equal the "high" triage token — but this is a
// role-card icon, not a priority indicator, so it's set via raw hex where
// used rather than the semantic triage class (triage colors are reserved for
// priority indicators only).
export function DoctorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M5.33333 12C4.62609 12 3.94781 12.281 3.44771 12.781C2.94762 13.2811 2.66667 13.9594 2.66667 14.6667V17.3333C2.66667 18.0406 2.94762 18.7189 3.44771 19.219C3.94781 19.719 4.62609 20 5.33333 20H10.6667C11.0203 20 11.3594 20.1405 11.6095 20.3905C11.8595 20.6406 12 20.9797 12 21.3333V26.6667C12 27.3739 12.281 28.0522 12.781 28.5523C13.2811 29.0524 13.9594 29.3333 14.6667 29.3333H17.3333C18.0406 29.3333 18.7189 29.0524 19.219 28.5523C19.719 28.0522 20 27.3739 20 26.6667V21.3333C20 20.9797 20.1405 20.6406 20.3905 20.3905C20.6406 20.1405 20.9797 20 21.3333 20H26.6667C27.3739 20 28.0522 19.719 28.5523 19.219C29.0524 18.7189 29.3333 18.0406 29.3333 17.3333V14.6667C29.3333 13.9594 29.0524 13.2811 28.5523 12.781C28.0522 12.281 27.3739 12 26.6667 12H21.3333C20.9797 12 20.6406 11.8595 20.3905 11.6095C20.1405 11.3594 20 11.0203 20 10.6667V5.33333C20 4.62609 19.719 3.94781 19.219 3.44771C18.7189 2.94762 18.0406 2.66667 17.3333 2.66667H14.6667C13.9594 2.66667 13.2811 2.94762 12.781 3.44771C12.281 3.94781 12 4.62609 12 5.33333V10.6667C12 11.0203 11.8595 11.3594 11.6095 11.6095C11.3594 11.8595 11.0203 12 10.6667 12H5.33333Z"
        stroke="currentColor"
        strokeWidth="2.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MessageIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M4 5h16v11H8l-4 4V5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M1.5465 8.739C1.48399 8.90739 1.48399 9.09261 1.5465 9.261C2.15528 10.7371 3.18864 11.9992 4.51558 12.8873C5.84252 13.7754 7.40328 14.2495 9 14.2495C10.5967 14.2495 12.1575 13.7754 13.4844 12.8873C14.8114 11.9992 15.8447 10.7371 16.4535 9.261C16.516 9.09261 16.516 8.90739 16.4535 8.739C15.8447 7.26289 14.8114 6.00078 13.4844 5.11267C12.1575 4.22457 10.5967 3.75046 9 3.75046C7.40328 3.75046 5.84252 4.22457 4.51558 5.11267C3.18864 6.00078 2.15528 7.26289 1.5465 8.739Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 11.25C10.2426 11.25 11.25 10.2426 11.25 9C11.25 7.75736 10.2426 6.75 9 6.75C7.75736 6.75 6.75 7.75736 6.75 9C6.75 10.2426 7.75736 11.25 9 11.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EyeOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M2 12s3.5-6 10-6c1.6 0 3 .3 4.2.8M22 12s-3.5 6-10 6c-1.6 0-3-.3-4.2-.8M3 3l18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7.5 2.25L3.375 6.375L1.5 4.5"
        stroke="currentColor"
        strokeWidth="1.125"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10.268 21C10.4435 21.304 10.696 21.5565 11 21.732C11.3041 21.9075 11.6489 21.9999 12 21.9999C12.3511 21.9999 12.6959 21.9075 13 21.732C13.304 21.5565 13.5565 21.304 13.732 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.262 15.326C3.13136 15.4692 3.04515 15.6472 3.01386 15.8385C2.98256 16.0298 3.00752 16.226 3.08571 16.4034C3.16389 16.5807 3.29194 16.7316 3.45426 16.8375C3.61658 16.9434 3.80618 16.9999 4 17H20C20.1938 17.0001 20.3834 16.9438 20.5459 16.8381C20.7083 16.7324 20.8365 16.5817 20.9149 16.4045C20.9933 16.2273 21.0185 16.0311 20.9874 15.8398C20.9564 15.6485 20.8704 15.4703 20.74 15.327C19.41 13.956 18 12.499 18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 12.499 4.589 13.956 3.262 15.326Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BPIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12.6667 9.33333C13.66 8.36 14.6667 7.19333 14.6667 5.66667C14.6667 4.69421 14.2804 3.76158 13.5927 3.07394C12.9051 2.38631 11.9725 2 11 2C9.82667 2 9 2.33333 8 3.33333C7 2.33333 6.17333 2 5 2C4.02754 2 3.09491 2.38631 2.40728 3.07394C1.71964 3.76158 1.33333 4.69421 1.33333 5.66667C1.33333 7.2 2.33333 8.36667 3.33333 9.33333L8 14L12.6667 9.33333Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5.33333 1.33333V4" />
        <path d="M10.6667 1.33333V4" />
        <path d="M12.6667 2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V4C14 3.26362 13.403 2.66667 12.6667 2.66667Z" />
        <path d="M2 6.66667H14" />
      </g>
    </svg>
  );
}

export function HeartRateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M14.6667 8H13.0133C12.722 7.99938 12.4384 8.0942 12.2061 8.26998C11.9737 8.44575 11.8053 8.6928 11.7267 8.97333L10.16 14.5467C10.1499 14.5813 10.1288 14.6117 10.1 14.6333C10.0712 14.655 10.0361 14.6667 10 14.6667C9.96394 14.6667 9.92885 14.655 9.9 14.6333C9.87115 14.6117 9.8501 14.5813 9.84 14.5467L6.16 1.45333C6.1499 1.41871 6.12885 1.3883 6.1 1.36667C6.07115 1.34503 6.03606 1.33333 6 1.33333C5.96394 1.33333 5.92885 1.34503 5.9 1.36667C5.87115 1.3883 5.8501 1.41871 5.84 1.45333L4.27333 7.02667C4.19498 7.3061 4.02759 7.55234 3.79658 7.72801C3.56556 7.90367 3.28355 7.99917 2.99333 8H1.33333" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PartnerIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M17.4167 12.8333C18.7825 11.495 20.1667 9.89083 20.1667 7.79167C20.1667 6.45453 19.6355 5.17217 18.69 4.22667C17.7445 3.28117 16.4621 2.75 15.125 2.75C13.5117 2.75 12.375 3.20833 11 4.58333C9.625 3.20833 8.48833 2.75 6.875 2.75C5.53787 2.75 4.2555 3.28117 3.31 4.22667C2.36451 5.17217 1.83333 6.45453 1.83333 7.79167C1.83333 9.9 3.20833 11.5042 4.58333 12.8333L11 19.25L17.4167 12.8333Z" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NavHomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M13.75 19.25V11.9167C13.75 11.6736 13.6534 11.4404 13.4815 11.2685C13.3096 11.0966 13.0764 11 12.8333 11H9.16667C8.92355 11 8.69039 11.0966 8.51849 11.2685C8.34658 11.4404 8.25 11.6736 8.25 11.9167V19.25" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.75 9.16667C2.74994 8.89998 2.80806 8.63649 2.92031 8.39457C3.03255 8.15266 3.19623 7.93815 3.39992 7.766L9.81658 2.26692C10.1475 1.98725 10.5667 1.83381 11 1.83381C11.4333 1.83381 11.8525 1.98725 12.1834 2.26692L18.6001 7.766C18.8038 7.93815 18.9674 8.15266 19.0797 8.39457C19.1919 8.63649 19.2501 8.89998 19.25 9.16667V17.4167C19.25 17.9029 19.0568 18.3692 18.713 18.713C18.3692 19.0568 17.9029 19.25 17.4167 19.25H4.58333C4.0971 19.25 3.63079 19.0568 3.28697 18.713C2.94315 18.3692 2.75 17.9029 2.75 17.4167V9.16667Z" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NavRecordsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.75 1.83333H5.5C5.01377 1.83333 4.54745 2.02649 4.20364 2.3703C3.85982 2.71412 3.66667 3.18044 3.66667 3.66667V18.3333C3.66667 18.8196 3.85982 19.2859 4.20364 19.6297C4.54745 19.9735 5.01377 20.1667 5.5 20.1667H16.5C16.9862 20.1667 17.4525 19.9735 17.7964 19.6297C18.1402 19.2859 18.3333 18.8196 18.3333 18.3333V6.41667L13.75 1.83333Z" />
        <path d="M12.8333 1.83333V5.5C12.8333 5.98623 13.0265 6.45255 13.3703 6.79636C13.7141 7.14018 14.1804 7.33333 14.6667 7.33333H18.3333" />
        <path d="M9.16667 8.25H7.33333" />
        <path d="M14.6667 11.9167H7.33333" />
        <path d="M14.6667 15.5833H7.33333" />
      </g>
    </svg>
  );
}

export function NavReferralIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M13.3247 19.8788C13.3595 19.9656 13.42 20.0397 13.4982 20.0911C13.5763 20.1425 13.6683 20.1687 13.7618 20.1663C13.8553 20.1639 13.9458 20.133 14.0212 20.0777C14.0966 20.0224 14.1532 19.9453 14.1836 19.8568L20.1419 2.44017C20.1713 2.35894 20.1769 2.27105 20.1581 2.18676C20.1393 2.10247 20.0969 2.02528 20.0358 1.96421C19.9747 1.90315 19.8975 1.86074 19.8132 1.84194C19.729 1.82315 19.6411 1.82875 19.5598 1.85808L2.14317 7.81642C2.0547 7.84675 1.97764 7.90342 1.92232 7.97882C1.86699 8.05422 1.83606 8.14474 1.83366 8.23823C1.83127 8.33172 1.85753 8.4237 1.90892 8.50183C1.96031 8.57997 2.03437 8.64051 2.12117 8.67533L9.39033 11.5903C9.62013 11.6823 9.82891 11.8199 10.0041 11.9948C10.1793 12.1697 10.3172 12.3782 10.4097 12.6078L13.3247 19.8788Z" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.0328 1.96808L10.0045 11.9955" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NavAlertsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20.1667C16.0626 20.1667 20.1667 16.0626 20.1667 11C20.1667 5.93739 16.0626 1.83333 11 1.83333C5.93739 1.83333 1.83333 5.93739 1.83333 11C1.83333 16.0626 5.93739 20.1667 11 20.1667Z" />
        <path d="M11 7.33333V11" />
        <path d="M11 14.6667H11.01" />
      </g>
    </svg>
  );
}

export function NavProfileIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M17.4167 19.25V17.4167C17.4167 16.4442 17.0304 15.5116 16.3427 14.8239C15.6551 14.1363 14.7225 13.75 13.75 13.75H8.25C7.27754 13.75 6.34491 14.1363 5.65727 14.8239C4.96964 15.5116 4.58333 16.4442 4.58333 17.4167V19.25" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 10.0833C13.025 10.0833 14.6667 8.44171 14.6667 6.41667C14.6667 4.39162 13.025 2.75 11 2.75C8.97496 2.75 7.33333 4.39162 7.33333 6.41667C7.33333 8.44171 8.97496 10.0833 11 10.0833Z" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AnalyticsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M2.75 19.25H19.25" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.41667 19.25V10.0833" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 19.25V4.58333" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5833 19.25V13.75" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AlertTriangleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55297 18.6453 1.55199 18.9945C1.55101 19.3437 1.64149 19.6871 1.81443 19.9905C1.98736 20.2939 2.23673 20.5467 2.53771 20.7239C2.83869 20.901 3.1808 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.901 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89726 12 2.89726C11.6563 2.89726 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22.3984 22.3984" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M5.5996 2.7998L18.6653 11.1992L5.5996 19.5986V2.7998Z" fill="currentColor" stroke="currentColor" strokeWidth="1.86653" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PhoneCallIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M14.6667 11.28V13.28C14.6674 13.4657 14.6294 13.6494 14.555 13.8196C14.4806 13.9897 14.3715 14.1424 14.2347 14.2679C14.0979 14.3934 13.9364 14.489 13.7605 14.5485C13.5846 14.608 13.3982 14.63 13.2133 14.6133C11.1619 14.3904 9.19133 13.6894 7.46 12.5667C5.84922 11.5431 4.48356 10.1774 3.46 8.56667C2.33332 6.82747 1.63216 4.84733 1.41333 2.78667C1.39667 2.60231 1.41858 2.41651 1.47767 2.24108C1.53675 2.06566 1.63171 1.90446 1.75651 1.76775C1.88131 1.63104 2.0332 1.52181 2.20253 1.44701C2.37185 1.37222 2.55489 1.33351 2.74 1.33333H4.74C5.06354 1.33015 5.37719 1.44472 5.62251 1.65569C5.86782 1.86666 6.02805 2.15963 6.07333 2.48C6.15775 3.12004 6.3143 3.74848 6.54 4.35333C6.6297 4.59195 6.64911 4.85128 6.59594 5.10059C6.54277 5.3499 6.41924 5.57874 6.24 5.76L5.39333 6.60667C6.34237 8.2757 7.7243 9.65763 9.39333 10.6067L10.24 9.76C10.4213 9.58076 10.6501 9.45723 10.8994 9.40406C11.1487 9.35089 11.4081 9.3703 11.6467 9.46C12.2515 9.6857 12.88 9.84225 13.52 9.92667C13.8438 9.97235 14.1396 10.1355 14.351 10.385C14.5624 10.6345 14.6748 10.9531 14.6667 11.28Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 14L11.1333 11.1333" stroke="currentColor" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M10.2539 5.72135C11.1978 5.72135 11.9629 4.95621 11.9629 4.01236C11.9629 3.06851 11.1978 2.30337 10.2539 2.30337C9.31008 2.30337 8.54494 3.06851 8.54494 4.01236C8.54494 4.95621 9.31008 5.72135 10.2539 5.72135Z" stroke="currentColor" strokeWidth="1.13933" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.41797 9.70899C4.36182 9.70899 5.12696 8.94385 5.12696 8C5.12696 7.05615 4.36182 6.29101 3.41797 6.29101C2.47413 6.29101 1.70899 7.05615 1.70899 8C1.70899 8.94385 2.47413 9.70899 3.41797 9.70899Z" stroke="currentColor" strokeWidth="1.13933" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10.2539 13.6966C11.1978 13.6966 11.9629 12.9315 11.9629 11.9876C11.9629 11.0438 11.1978 10.2787 10.2539 10.2787C9.31008 10.2787 8.54494 11.0438 8.54494 11.9876C8.54494 12.9315 9.31008 13.6966 10.2539 13.6966Z" stroke="currentColor" strokeWidth="1.13933" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.8934 8.86019L8.7842 11.1274" stroke="currentColor" strokeWidth="1.13933" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.7785 4.87255L4.8934 7.13981" stroke="currentColor" strokeWidth="1.13933" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PatientsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M14.6667 19.25V17.4167C14.6667 16.4442 14.2804 15.5116 13.5927 14.8239C12.9051 14.1363 11.9725 13.75 11 13.75H5.5C4.52754 13.75 3.59491 14.1363 2.90728 14.8239C2.21964 15.5116 1.83333 16.4442 1.83333 17.4167V19.25" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.25 10.0833C10.275 10.0833 11.9167 8.44171 11.9167 6.41667C11.9167 4.39162 10.275 2.75 8.25 2.75C6.22496 2.75 4.58333 4.39162 4.58333 6.41667C4.58333 8.44171 6.22496 10.0833 8.25 10.0833Z" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.1667 19.25V17.4167C20.1661 16.6043 19.8957 15.815 19.3979 15.173C18.9002 14.5309 18.2033 14.0723 17.4167 13.8692" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.6667 2.86917C15.4554 3.07111 16.1545 3.52981 16.6537 4.17295C17.1529 4.81609 17.4239 5.60709 17.4239 6.42125C17.4239 7.23541 17.1529 8.02641 16.6537 8.66955C16.1545 9.31269 15.4554 9.77139 14.6667 9.97333" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ReferralArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M6.41667 6.41667H15.5833V15.5833" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.41667 15.5833L15.5833 6.41667" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function FlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M19.9192 16.5L12.5858 3.66667C12.4259 3.38452 12.1941 3.14984 11.9138 2.98656C11.6336 2.82329 11.3151 2.73726 10.9908 2.73726C10.6665 2.73726 10.348 2.82329 10.0678 2.98656C9.78761 3.14984 9.55573 3.38452 9.39583 3.66667L2.0625 16.5C1.90088 16.7799 1.81613 17.0976 1.81684 17.4208C1.81756 17.744 1.90371 18.0613 2.06658 18.3405C2.22944 18.6197 2.46322 18.8509 2.74422 19.0106C3.02522 19.1703 3.34346 19.2529 3.66667 19.25H18.3333C18.655 19.2497 18.9709 19.1647 19.2493 19.0037C19.5278 18.8426 19.759 18.6112 19.9196 18.3325C20.0803 18.0539 20.1649 17.7379 20.1648 17.4162C20.1647 17.0945 20.08 16.7786 19.9192 16.5Z" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 8.25V11.9167" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 15.5833H11.01" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M7.33333 1.83333V5.5" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.6667 1.83333V5.5" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.4167 3.66667H4.58333C3.57081 3.66667 2.75 4.48748 2.75 5.5V18.3333C2.75 19.3459 3.57081 20.1667 4.58333 20.1667H17.4167C18.4292 20.1667 19.25 19.3459 19.25 18.3333V5.5C19.25 4.48748 18.4292 3.66667 17.4167 3.66667Z" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.75 9.16667H19.25" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M4.58333 11H17.4167" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 4.58333V17.4167" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NavPatientsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M14.6667 19.25V17.4167C14.6667 16.4442 14.2804 15.5116 13.5927 14.8239C12.9051 14.1363 11.9725 13.75 11 13.75H5.5C4.52754 13.75 3.59491 14.1363 2.90728 14.8239C2.21964 15.5116 1.83333 16.4442 1.83333 17.4167V19.25" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.25 10.0833C10.275 10.0833 11.9167 8.44171 11.9167 6.41667C11.9167 4.39162 10.275 2.75 8.25 2.75C6.22496 2.75 4.58333 4.39162 4.58333 6.41667C4.58333 8.44171 6.22496 10.0833 8.25 10.0833Z" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.1667 19.25V17.4167C20.1661 16.6043 19.8957 15.815 19.3979 15.173C18.9002 14.5309 18.2033 14.0723 17.4167 13.8692" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.6667 2.86917C15.4554 3.07111 16.1545 3.52981 16.6537 4.17295C17.1529 4.81609 17.4239 5.60709 17.4239 6.42125C17.4239 7.23541 17.1529 8.02641 16.6537 8.66955C16.1545 9.31269 15.4554 9.77139 14.6667 9.97333" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NavReferralsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M16.5 19.25C18.0188 19.25 19.25 18.0188 19.25 16.5C19.25 14.9812 18.0188 13.75 16.5 13.75C14.9812 13.75 13.75 14.9812 13.75 16.5C13.75 18.0188 14.9812 19.25 16.5 19.25Z" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 8.25C7.01878 8.25 8.25 7.01878 8.25 5.5C8.25 3.98122 7.01878 2.75 5.5 2.75C3.98122 2.75 2.75 3.98122 2.75 5.5C2.75 7.01878 3.98122 8.25 5.5 8.25Z" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 19.25V8.25C5.5 10.438 6.36919 12.5365 7.91637 14.0836C9.46354 15.6308 11.562 16.5 13.75 16.5" stroke="currentColor" strokeWidth="1.83333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PencilIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M11.34 2a1.886 1.886 0 1 1 2.667 2.667L5 13.68l-3.667 1 1-3.667L11.34 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LocationPinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M14 6.667c0 4.667-6 8.667-6 8.667s-6-4-6-8.667a6 6 0 1 1 12 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="6.667" r="2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldCheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M8 14.667s5.333-2.667 5.333-6.667V3.333L8 1.333l-5.333 2V8c0 4 5.333 6.667 5.333 6.667z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 8l1.333 1.333L10 6.667" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EmergencyBellIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M11.9793 24.5C12.1841 24.8547 12.4787 25.1492 12.8334 25.354C13.1881 25.5588 13.5904 25.6666 14 25.6666C14.4096 25.6666 14.8119 25.5588 15.1666 25.354C15.5213 25.1492 15.8159 24.8547 16.0207 24.5" stroke="currentColor" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.80567 17.8803C3.65326 18.0474 3.55268 18.2551 3.51616 18.4783C3.47965 18.7014 3.50877 18.9304 3.59999 19.1373C3.69121 19.3442 3.84059 19.5201 4.02997 19.6437C4.21934 19.7673 4.44054 19.8332 4.66667 19.8333H23.3333C23.5594 19.8334 23.7807 19.7678 23.9702 19.6445C24.1597 19.5211 24.3092 19.3454 24.4007 19.1386C24.4922 18.9318 24.5216 18.7029 24.4853 18.4798C24.4491 18.2566 24.3488 18.0487 24.1967 17.8815C22.645 16.282 21 14.5822 21 9.33333C21 7.47682 20.2625 5.69634 18.9497 4.38359C17.637 3.07083 15.8565 2.33333 14 2.33333C12.1435 2.33333 10.363 3.07083 9.05025 4.38359C7.7375 5.69634 7 7.47682 7 9.33333C7 14.5822 5.35383 16.282 3.80567 17.8803Z" stroke="currentColor" strokeWidth="2.33333" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
