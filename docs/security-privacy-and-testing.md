# Security, privacy & testing

## Authentication

Two entirely separate JWT systems — see [`roles-and-access-control.md`](./roles-and-access-control.md) for the full reasoning. Summary:

- `jose` (HS256), not `jsonwebtoken` — the access-token check runs in Next.js middleware on the edge runtime, where Node's `crypto` module isn't available.
- Clinical/mother: `access_token` (15 min) + `refresh_token` (30 days), both httpOnly, `sameSite: lax`, `secure` in production only.
- Admin: `admin_session` (8 hours), same cookie properties, verified against a separate secret (`SUPER_ADMIN_JWT_SECRET`) and a separate table (`SuperAdmin`).
- Passwords hashed with `bcryptjs` (cost factor 12).
- A missing required secret **throws in production** rather than falling back to a public default (`lib/auth.ts`'s `jwtSecret()`) — it only uses a dev-only default when `NODE_ENV !== "production"`.
- Admin password changes only take effect once an OTP sent to the admin's own phone is confirmed (`pendingPasswordHash` + `otp`/`otpExpiry` on `SuperAdmin`) — otherwise a hijacked-but-unlocked session could silently lock the real admin out with no recovery path.

## Rate limiting (`lib/rate-limit.ts`)

In-memory, fixed-window, per-process. `limitAttempts(scope, key, limit)` tracks attempts over a 15-minute window (e.g. `limitAttempts("login", phone, 10)`). A background sweep (at most once a minute) prunes expired entries so the map can't grow forever on a long-running process.

`clientIp()` deliberately reads the **last** hop of `x-forwarded-for`, not the first — the last hop is the one the hosting platform itself appends; earlier hops are client-supplied and would let an attacker rotate through buckets by sending a fake header.

**Known limitation:** this only works correctly for a single server process — state doesn't survive a restart or scale-out to multiple instances. Documented directly in the source as needing `@upstash/ratelimit` + Redis (or equivalent) before a true multi-instance production deployment.

## Access control

Covered in full in [`roles-and-access-control.md`](./roles-and-access-control.md): every query is scoped server-side by the verified session's `facilityId`/`userId`; a cross-facility patient lookup returns 404, not 403; referral sharing is the one explicit, logged, time-limited exception, re-checked on every read.

## Audit logging (`lib/audit.ts`)

Every sensitive action writes an `AuditLog` row: `actorId` (a real `User`) or `actorLabel` (free text, used for Super Admin portal actions, since `SuperAdmin` has no `User` row to reference), the action, entity type/id, optional structured `metadata`, and the request's IP. Facility-scoped admin actions (staff created/updated/deactivated/OTP-resent) also set `facilityId`, so a Facility Admin's own audit view can filter to just their facility; platform-level actions leave it null.

**The Audit Log "clear all" and Facility Admin hard-delete features are testing-only.** The project owner's stated intent is to remove or gate them before any real deployment — they exist now purely to make resetting test data straightforward during coursework development.

## Data protection & privacy

- **All testing used synthetic data only.** No real patient information has been used at any point.
- Data handling follows the principles of Ghana's Data Protection Act 2012.
- Phone numbers are masked for display (`lib/mask.ts`): `+233241234567` → `+233 24 XXX XXXX`.
- **Known limitation:** the admin *search* endpoint deliberately never returns patients (enforced and tested), but some admin-facing staff-management views can still expose patient names/phone numbers. Tightening this further is listed as future work.
- SMS and email delivery are built but not connected to a live provider by default — `lib/hubtel.ts` and `lib/email.ts` both log to console instead of sending when credentials are unset, which is the default/local state. This was a deliberate choice to avoid risking real message sends to real-looking phone numbers during development and testing.

## Known limitations, stated directly

- No formal clinical validation or usability study has been run yet with real midwives/clinicians.
- Clinical flagging thresholds are fixed system-wide, not yet configurable per facility.
- Rate limiting doesn't survive multiple server instances (see above).
- Concurrent edits to the same record by two clinicians haven't been specifically stress-tested.
- SMS/email need a live provider connected before any real-world use.

## Future work

- Connect live SMS and email delivery.
- Administrator-configurable clinical thresholds.
- Shared rate-limit store (Redis-backed); tie messaging more tightly to referral-share expiry.
- Usability study with real midwives, and clinical review of the flagging thresholds, with actual clinicians.
- Remove or gate the testing-only hard-delete/clear-all admin features before real deployment.

## Testing & CI

- **Unit tests** — Vitest, `tests/*.test.ts`. Mock Prisma/auth/SMS/email; never send a real message. Run with `npm test`.
- **Browser/E2E tests** — Playwright, `tests/e2e/*.spec.ts`. `playwright.config.ts` starts the dev server itself if one isn't already running (`reuseExistingServer: true`), so `npm run test:e2e` is self-contained. Currently covers the public onboarding and recovery pages.
- **CI** (`.github/workflows/ci.yml`) — on every push and pull request, in order: typecheck (`tsc --noEmit`), lint, unit tests, build, then installs a Chromium browser and runs the Playwright suite.

What the existing test suite actually verifies (not exhaustive, but representative — see `tests/access-rules.test.ts` and `tests/lab-result-notifications.test.ts`):

- A request with no session is refused (401).
- A patient at another facility returns 404 without revealing she exists.
- A midwife at the same facility can read the patient.
- Login attempts are blocked after the limit, *before* the user lookup even runs.
- An unknown account and a wrong password get the identical error message (no account enumeration).
- Admin search never returns patients, and staff search results are limited to the admin's own facility.
- A lab result being marked ready notifies the right people — the other midwives at the facility if a midwife requested it (excluding the requester), or the facility's midwives plus doctors with an *active, unexpired* share if a doctor requested it.
