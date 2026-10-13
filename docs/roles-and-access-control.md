# Roles & access control

## The five clinical/patient roles

| Role | Scope | Can do |
| --- | --- | --- |
| **Midwife** | Own facility | Register mothers, log vitals, request lab tests, initiate referrals, message patients/staff |
| **Doctor** (UI label: "Gynaecologist") | Own facility | Receive referrals, open time-limited shared records from midwives, manage own referral queue |
| **Lab Technician** | Own facility | Process lab requests (`Pending → In Progress → Ready`/`Cancelled`) |
| **Mother** | Own record only | View her own record and vitals trends, book appointments, report symptoms, send an emergency alert, generate a partner share link, set notification preferences |
| **Partner** | Whatever the mother shared | Read-only. Not self-registered — activated by using a mother's share link |

All five live in the single `User` table, distinguished by the `Role` enum.

## The admin hierarchy — a deliberately separate system

Admins manage **facilities and staff accounts**, never clinical data. This is enforced structurally, not just by convention:

| | Clinical/Mother side | Admin side |
| --- | --- | --- |
| Table | `User` | `SuperAdmin` |
| Cookie | `access_token` + `refresh_token` | `admin_session` |
| Secret env var | `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | `SUPER_ADMIN_JWT_SECRET` |
| Token lifetime | 15 min access / 30 day refresh | 8 hours |
| Verify helper | `getCurrentUser()` (`lib/current-user.ts`) | `getAdminSessionFromRequest()` (`lib/admin-auth.ts`) |

An admin session is never checked against patient-facing authorization logic, and vice versa — compromising one credential set doesn't hand over the other.

Four tiers, inferred from which scope field is set on the `SuperAdmin` row (enforced in the admin-creation API routes):

- **Platform Super Admin** — `facilityId`/`districtId`/`regionId` all null. Bootstrapped once from `SUPER_ADMIN_EMAIL`/`SUPER_ADMIN_PASSWORD` env vars on an empty database; logs in with email + password. Manages the full facility list, creates Regional/District/Facility Admins, sends platform-wide broadcasts.
- **Regional Admin** — `regionId` set.
- **District Admin** — `districtId` set.
- **Facility Admin** — `facilityId` set. Manages that one facility's staff (create, deactivate, resend activation OTP). Logs in by phone + OTP, just like staff — activated the same way (`isActive`/`passwordHash` null until then).

**Admins can never see patients.** `app/api/admin/search/route.ts` deliberately never queries or returns `Patient` rows — admins search facilities and staff only. This is covered by an automated test (`tests/access-rules.test.ts`): *"never returns patients, even when the search matches one."*

## How access control is actually enforced

Not a UI convention — checked server-side, on every request, in the route handler itself:

1. The request's JWT is verified (`verifyAccessToken()` / `verifyAdminToken()`), yielding `{ userId, role, facilityId }` (or the admin's scope fields).
2. Every Prisma query from that point is filtered by that `facilityId` (staff) or `userId` (mother) — it is never left to the client to hide rows it shouldn't see.
3. A patient lookup outside your facility returns **404, not 403** — the response doesn't even confirm the patient exists elsewhere (verified by `tests/access-rules.test.ts`: *"returns 404 for a patient at another facility, without revealing she exists"*).
4. The one explicit, intentional exception is `ReferralShare` — and that's logged, time-limited, and re-checked on every read (see [`data-model.md`](./data-model.md)).

## Auth library choice

`jose`, not `jsonwebtoken` — the access-token check runs inside Next.js **middleware**, which executes on the edge runtime, where Node's `crypto` module (what `jsonwebtoken` depends on) isn't available.

## Fail-closed secrets

`lib/auth.ts`'s `jwtSecret()` helper: if a required secret env var is missing, it throws in production rather than silently signing tokens with a public default. It only falls back to a dev-only default secret when `NODE_ENV !== "production"`. A missing secret in production is a hard failure, not a silent security hole.

## Silent session refresh

The access token lives only 15 minutes. `middleware.ts` handles expiry transparently: if the access token fails verification (expired) but a valid 30-day refresh token is present, it mints a fresh access token and continues the request — without this, every session would die mid-use on any 15-minute gap between clicks, forcing a re-login.
