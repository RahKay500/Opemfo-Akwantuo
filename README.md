# Ɔpemfoɔ Akwantuo

A maternal health record system for Ghana. Midwives register mothers, laboratory technicians process test requests, doctors review records, and mothers and their partners see their own care in one place.

Built with Next.js 14 (App Router), Prisma on PostgreSQL, and deployed on Vercel.

**Full documentation:** [`docs/`](./docs/README.md) — architecture, the full data model, roles & access control, the API reference, clinical workflows and flagging logic, and security/privacy/testing. This README is just the quick-start.

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

Five clinical/patient roles (Midwife, Doctor, Lab Technician, Mother, Partner) sharing one `User` table, plus a separate four-tier Admin hierarchy (Platform / Regional / District / Facility) with its own login system that never touches clinical data. Full breakdown: [`docs/roles-and-access-control.md`](./docs/roles-and-access-control.md).

## Clinical flagging

Vitals are checked against published thresholds (ISSHP for blood pressure, FIGO for fetal heart rate) when logged, and support clinical judgement rather than diagnosing. Full thresholds and sources: [`docs/workflows-and-clinical-logic.md`](./docs/workflows-and-clinical-logic.md).

## Known gaps

SMS/email aren't connected to a live provider by default, there's no formal clinical validation or usability study yet, some admin views can still show patient identifiers, and rate limiting doesn't yet survive multiple server instances. Full list with context: [`docs/security-privacy-and-testing.md`](./docs/security-privacy-and-testing.md).
