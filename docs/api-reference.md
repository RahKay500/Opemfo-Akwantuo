# API reference

Every route lives under `app/api/`. Grouped by area below; each still needs a verified session (see [`roles-and-access-control.md`](./roles-and-access-control.md)) unless marked **public**. This is a map of what exists and roughly what it's for, not a full request/response spec — read the route file itself for exact payloads.

## Auth — clinical/mother (`access_token`)

| Route | Purpose |
| --- | --- |
| `auth/login` | **Public.** Phone/email + password login. Rate-limited per identifier and per IP. |
| `auth/logout` | Clears `access_token`/`refresh_token`. |
| `auth/me` | Returns the current session's user. |
| `auth/refresh` | Exchanges a valid refresh token for a new access token (also happens transparently in middleware). |
| `auth/otp/send`, `auth/otp/verify` | **Public.** Activation-code flow for a newly registered mother or staff account. |
| `auth/set-password` | Completes account setup after OTP verification. |
| `auth/forgot-password` | **Public.** Password recovery. |

## Auth — admin (`admin_session`)

| Route | Purpose |
| --- | --- |
| `admin/auth/login`, `admin/auth/logout` | Platform Super Admin email/password login. |
| `admin/auth/activate/request`, `/link`, `/confirm` | Facility Admin activation (phone + OTP), mirroring staff activation. |
| `admin/auth/password`, `/password/confirm` | Admin password change — only takes effect once an OTP sent to the admin's own phone is confirmed, so a hijacked-but-unlocked session can't silently lock the real admin out. |
| `admin/auth/recover` | Admin password recovery. |

## Patients & clinical records

| Route | Purpose |
| --- | --- |
| `patients` | List/create patients (facility-scoped). |
| `patients/[id]` | Get one patient — 404 (not 403) if outside your facility. |
| `patients/[id]/visits` | Log/list visits (vitals, flagging — see `workflows-and-clinical-logic.md`). |
| `patients/[id]/vaccinations`, `/delivery` | Remaining MCH Record Book sections. |
| `patients/[id]/referrals` | List a patient's referrals. |
| `patients/[id]/share` | Create a `ReferralShare` (the time-limited doctor grant). |

## Referrals

| Route | Purpose |
| --- | --- |
| `referrals`, `referrals/[id]` | Create/list/update a referral; priority override, status transitions. |
| `referrals/[id]/share` | Share a referral's record with a specific doctor. |
| `referral-shares/[id]` | Read/revoke a specific share. |
| `referral-shares/[id]/forward` | Forward an active share to another doctor. |

## Lab

| Route | Purpose |
| --- | --- |
| `lab-requests`, `lab-requests/[id]` | Create a request (midwife/doctor); update status (lab technician): `REQUESTED → IN_PROGRESS → READY`/`CANCELLED`. Completing with a result notifies the requester's care team. |

## Mother-facing

| Route | Purpose |
| --- | --- |
| `mother/dashboard` | Her dashboard data. |
| `mother/account`, `/profile`, `/preferences` | Account/profile management, notification preferences. |
| `mother/partner-link` | Generate/revoke her partner share link. |

## Appointments, symptoms, emergencies

| Route | Purpose |
| --- | --- |
| `appointments`, `appointments/[id]` | Mother-initiated booking requests; staff confirm/decline. |
| `symptoms`, `symptoms/[id]` | Mother-reported symptoms. |
| `emergency`, `emergency/[id]` | Mother/partner emergency alert — fans out to the facility's active midwives. |

## Messaging & notifications

| Route | Purpose |
| --- | --- |
| `conversations`, `conversations/[id]`, `messages`, `messages/thread` | In-app messaging between staff and mothers/staff. |
| `notifications`, `notifications/[id]` | Generic, role-agnostic — reading and marking read work identically for every clinical/mother role (keyed only by the session's `userId`). |

## Per-role profile

| Route | Purpose |
| --- | --- |
| `midwife/profile`, `doctor/profile`, `lab-technician/profile` | Each role's own profile read/update. |
| `doctor/patients/[id]/next-visit` | Doctor's override of the midwife-suggested next-visit date. |

## Admin portal

| Route | Purpose |
| --- | --- |
| `admin/facilities`, `admin/facilities/[id]` | Facility CRUD — Platform/Regional/District only (a Facility Admin has no use for a cross-facility list). |
| `admin/staff`, `admin/staff/[id]`, `admin/staff/[id]/resend-otp` | Facility Admin's own staff management. |
| `admin/facility-admins`, `.../[id]`, `.../[id]/resend-otp` | Platform/Regional/District managing Facility Admin accounts. |
| `admin/regional-admins`, `admin/district-admins` | Platform managing the tiers below it. |
| `admin/search` | Facilities + staff only — **never patients** (see `roles-and-access-control.md`). |
| `admin/notifications` | Admin-side notifications (`AdminNotification`, separate from clinical `Notification`). |
| `admin/broadcast` | Platform Super Admin → all Facility Admins, in-app + SMS. |
| `admin/audit` | Audit log view, facility-scoped for a Facility Admin. |
| `admin/settings/profile` | Admin's own profile. |
| `admin/videos`, `admin/videos/[id]` | Manage Learn & Prepare content. |

## Misc

| Route | Purpose |
| --- | --- |
| `videos`, `videos/[id]`, `uploads/video` | Learn & Prepare video library (mother-facing) and upload handling (Vercel Blob). |
| `cron/appointment-reminders` | Vercel Cron, daily 08:00 UTC — see `architecture.md`. |
