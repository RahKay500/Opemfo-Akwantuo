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
