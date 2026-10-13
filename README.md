# Ɔpemfoɔ Akwantuo

A maternal health record system for Ghana. Midwives register mothers, laboratory technicians process test requests, doctors review records, and mothers and their partners see their own care in one place.

Built with Next.js 14 (App Router), Prisma on PostgreSQL, and deployed on Vercel.

## Running locally

```bash
npm install
# create a .env file with the values listed under Settings
npx prisma migrate dev
npm run dev
```

Open http://localhost:3000.

## Checks

```bash
npm run lint    # ESLint
npx tsc --noEmit  # typecheck
npm test        # unit tests (Vitest); these never send real email or SMS
npm run build
npm run test:e2e # browser tests (Playwright); starts the dev server itself if one isn't already running
```

CI runs all five on every push and pull request (`.github/workflows/ci.yml`). The Playwright suite (`tests/e2e/`) currently covers the public onboarding and recovery pages.

## Settings

Set these as environment variables. Never commit real values.

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Sign staff and mother sessions. Required in production. |
| `SUPER_ADMIN_JWT_SECRET` | Signs admin sessions. Required in production. |
| `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` | Bootstraps the first Super Admin on an empty database |
| `SMTP_USER`, `SMTP_PASS` | Gmail address and App Password for activation emails |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Optional email provider, used if SMTP isn't set |
| `HUBTEL_CLIENT_ID`, `HUBTEL_CLIENT_SECRET` | SMS for activation codes and lab result alerts |
| `HUBTEL_SENDER_ID` | SMS sender name shown to recipients. Defaults to `OpemfoAkwan` if unset. |
| `SHOW_DEV_OTP` | `true` shows activation codes on screen when SMS isn't connected. Development fallback only. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage for uploaded Learn & Prepare videos and audio |

Without email or SMS credentials, activation codes and links are shown on screen. That is a known gap; see the project notes before using the app with real patients.

## Deploying

Deploys run from Vercel. The build command applies database migrations (`prisma migrate deploy`) before building. Production settings live in the Vercel project's Environment Variables.

## Project layout

- `app/`: pages and API routes, grouped by role (`mother`, `midwife`, `doctor`, `lab-technician`, `partner`, `admin`), plus `onboarding`, `(auth)` (sign-in/recovery) and `referrals`
- `lib/`: auth, access checks, database queries, validation, email and SMS
- `prisma/`: schema and migrations
- `tests/`: unit tests (Vitest); `tests/e2e/`: browser tests (Playwright)

## Roles

- **Midwife** — registers mothers, logs vitals each visit, requests lab tests, initiates referrals. Scoped to her own facility.
- **Doctor** (shown in the UI as "Gynaecologist") — receives referrals and time-limited shared records from midwives, manages their facility's referral queue.
- **Lab Technician** — processes lab test requests (`Pending → In Progress → Ready`/`Cancelled`), scoped to their facility.
- **Mother** — the patient. Her own dashboard: record, vitals trends, referral status, appointment booking, symptom reporting, an emergency alert, and notification preferences.
- **Partner** — not self-registered. A mother generates a revocable share link from her profile; using it activates a read-only Partner account scoped to what she chose to share.
- **Admin** — a separate login and session system from the five roles above (`admin_session` cookie vs. `access_token`, separate JWT secret, separate `SuperAdmin` table). Four tiers — Platform, Regional, District, Facility — inferred from which scope field is set on the admin's row. Admins manage facilities and staff; the admin search endpoint deliberately never returns patients.

## Clinical flagging

Vitals are checked against published thresholds when logged, and support clinical judgement rather than diagnosing:

| Vital | High | Critical | Source |
| --- | --- | --- | --- |
| Systolic BP | ≥140 mmHg | ≥160 mmHg | ISSHP (Magee et al., 2022) |
| Diastolic BP | ≥90 mmHg | ≥110 mmHg | ISSHP (Magee et al., 2022) |
| Fetal heart rate | outside 110–160 bpm | — | FIGO (Ayres-de-Campos et al., 2015) |
| Temperature | >38°C | — | — |

Thresholds are fixed system-wide; they are not yet configurable per facility.

## Known gaps

- SMS/email delivery logs to console locally and is only sent for real once Hubtel/SMTP credentials are set — see Settings above.
- No formal clinical validation or usability study has been run yet.
- Some admin staff-management views can still show patient names/phone numbers, even though patient search itself is blocked for admins.
- Rate limiting (e.g. login attempts) lives in an in-memory map on a single process; a multi-instance deployment needs a shared store first.
