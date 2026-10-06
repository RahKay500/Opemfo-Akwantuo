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
```

CI runs all four on every push and pull request (`.github/workflows/ci.yml`).

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
| `SHOW_DEV_OTP` | `true` shows activation codes on screen when SMS isn't connected. Development fallback only. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob storage for uploaded Learn & Prepare videos and audio |

Without email or SMS credentials, activation codes and links are shown on screen. That is a known gap; see the project notes before using the app with real patients.

## Deploying

Deploys run from Vercel. The build command applies database migrations (`prisma migrate deploy`) before building. Production settings live in the Vercel project's Environment Variables.

## Project layout

- `app/`: pages and API routes, grouped by role (`mother`, `midwife`, `doctor`, `lab-technician`, `partner`, `admin`)
- `lib/`: auth, access checks, database queries, validation, email and SMS
- `prisma/`: schema and migrations
- `tests/`: unit tests
