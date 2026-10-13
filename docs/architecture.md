# Architecture

## Stack

- **Framework:** Next.js 14, App Router — one codebase serves every role's pages and every API route.
- **Database:** PostgreSQL, accessed through Prisma (schema + migrations in `prisma/`).
- **Auth:** `jose` for JWTs (HS256), `bcryptjs` for password hashing. Two entirely separate auth systems — see [`roles-and-access-control.md`](./roles-and-access-control.md).
- **SMS:** Hubtel (`lib/hubtel.ts`) — activation codes and lab-result alerts. Logs to console instead of sending when credentials are unset.
- **Email:** Gmail SMTP, or Resend as a fallback (`lib/email.ts`).
- **File storage:** Vercel Blob, for uploaded Learn & Prepare videos/audio.
- **Deployment:** Vercel. Scheduled jobs via Vercel Cron.
- **Testing:** Vitest (unit), Playwright (browser/E2E).
- **Styling:** Tailwind CSS with a custom brand palette (primary purple `#BA24D5`, deeper lilac `#821890`, pink accent `#EE46BC`; heading font Nunito, body font Inter).

## Why Next.js App Router for everything

A single codebase keeps the API routes and the five role-based UIs (plus the separate admin portal) co-located, sharing types, validation (`lib/validations/`), and query helpers (`lib/queries/`) directly — no separate backend repo, no API client generation, which matters for a two-person team on a fixed deadline. The cost is that Next.js middleware runs on the edge runtime, which shaped the auth library choice (see below).

## Project layout

```
app/
  (auth)/          sign-in, recovery — public, unauthenticated
  onboarding/       "who are you?" entry point
  admin/            admin portal — its own layout, its own auth
  midwife/          midwife pages
  doctor/           doctor ("Gynaecologist") pages
  lab-technician/   lab technician pages
  mother/           mother pages
  partner/          partner (shared-link) pages
  referrals/        cross-role referral views
  api/              every API route (see api-reference.md)
lib/
  auth.ts             clinical/mother JWT signing & verification
  admin-auth.ts        admin JWT signing & verification (separate system)
  current-user.ts      resolves the logged-in clinical/mother user from the request
  current-admin.ts     resolves the logged-in admin from the request
  flagging.ts          clinical vital thresholds
  notifications.ts      shared notification type -> icon/color/label mapping (staff side)
  rate-limit.ts         in-memory fixed-window rate limiter
  audit.ts              writes AuditLog rows
  hubtel.ts             SMS sending (Hubtel)
  email.ts              email sending (SMTP/Resend)
  mch-record.ts, pregnancy.ts   MCH Record Book domain helpers
  staff-cascade-delete.ts       manual cascade delete (no DB-level ON DELETE CASCADE — see data-model.md)
  mask.ts               phone number masking for display
  queries/              one file per page/role, each a typed data-fetching function for that screen
  validations/           Zod schemas
prisma/
  schema.prisma     the full data model
  migrations/       migration history
tests/
  *.test.ts         Vitest unit tests
  e2e/*.spec.ts     Playwright browser tests
```

## Request flow (clinical/mother side)

1. Request arrives with an `access_token` cookie (httpOnly, 15-minute JWT).
2. `middleware.ts` verifies it; if expired but a valid `refresh_token` cookie (30-day JWT) exists, it transparently mints a new access token.
3. The page/route calls `getCurrentUser()` (`lib/current-user.ts`), which re-verifies the token server-side and returns `{ userId, role, facilityId }`.
4. Every database query from there is scoped by that `facilityId` (staff) or `userId` (mother) — not left to the UI to hide.

## Request flow (admin side)

Identical shape, entirely separate implementation: `admin_session` cookie, `getAdminSessionFromRequest()` (`lib/admin-auth.ts`), a `SuperAdmin` row instead of a `User` row. See [`roles-and-access-control.md`](./roles-and-access-control.md) for why these are kept apart.

## Scheduled jobs

One Vercel Cron job, defined in `vercel.json`:

```json
{ "path": "/api/cron/appointment-reminders", "schedule": "0 8 * * *" }
```

Runs daily at 08:00 UTC, hitting `app/api/cron/appointment-reminders/route.ts`.

## Deployment

Vercel builds with `npx prisma migrate deploy && npm run build` (also set in `vercel.json`'s `buildCommand`), so schema migrations apply automatically before each deploy. Production environment variables live in the Vercel project's own settings — see the Settings table in the top-level README for what's required.
