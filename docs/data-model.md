# Data model

Full schema lives in `prisma/schema.prisma` (~30 models). This groups them by domain and explains the non-obvious design choices — the comments in the schema file itself go further still for any one field.

## People & facilities

- **`User`** — midwife, doctor, lab technician, mother, or partner (`Role` enum: `MOTHER`, `MIDWIFE`, `DOCTOR`, `LAB_TECHNICIAN`, `PARTNER`). All five share one table.
- **`SuperAdmin`** — deliberately **not** in `User`. Admins aren't clinical staff and shouldn't be reachable through any role-based query on the `User` table. Tier (Platform / Regional / District / Facility) is inferred from which of `regionId` / `districtId` / `facilityId` is set — none set means Platform Super Admin. This is enforced in the admin-creation API routes, not by the database.
- **`Region`**, **`District`**, **`Facility`** — the location hierarchy a `User` or `SuperAdmin` is scoped to. `Facility.type` is one of `CHPS`, `HEALTH_CENTRE`, `DISTRICT_HOSPITAL`, `REGIONAL_HOSPITAL`, `TEACHING_HOSPITAL`.

## The patient record

- **`Patient`** — the digitized MCH Record Book. Demographics, then by MCH Record Book page:
  - Family Identification (NHIS number, marital status, occupation, spouse details, community)
  - Obstetric History (gravida/para, `previousPregnancies` as structured JSON — one entry per prior pregnancy — plus `majorRiskFactors` as a string array)
  - Medical / Social / Family History (each a JSON block mirroring the document's own checkbox layout)
  - Physical Examination at First Visit (JSON: general condition, face, head/neck, breasts, abdomen, heart, lung)
  - Investigations (blood group, Rh typing, HBsAg, sickling, G6PD, VDRL, HIV status, first-visit Hb, urine/stool RE)
  - Notification preferences (`notifyAppointments`, `notifyReferralUpdates`, `notifyEducationalContent`, `notifyLabResults`) — set by the mother from her Profile screen
  - `datingMethod`/`scanDate` alongside `lmp`/`edd` — LMP dating is unreliable with irregular cycles, so when dating is by ultrasound instead, `lmp` still holds a back-calculated "effective LMP" (scan date minus gestational age at scan), keeping every existing week/EDD calculation elsewhere unchanged. `datingMethod`/`scanDate` exist purely so the UI can show *how* dating was established.
  - `doctorNextVisitOverride` — a doctor can override the midwife's auto-suggested next-visit date; it takes precedence on the mother's dashboard when set and in the future, and `null` reverts to the midwife's own date.

- **`Visit`** — one row per antenatal/postnatal visit. Vitals (systolic/diastolic BP, fetal heart rate, temperature, weight, fundal height), urine protein/sugar, oedema, fetal presentation/descent, complaints, and `flagged`/`flagReason`/`flagPriority` set by `lib/flagging.ts` against the thresholds in [`workflows-and-clinical-logic.md`](./workflows-and-clinical-logic.md).

- **`Vaccination`**, **`IptpDose`**, **`DeliveryRecord`**, **`PostnatalVisit`** (`PNC1`/`PNC2`/`PNC3`, per the MCH Record Book's 24-48hr / 6-7 day / 6-week schedule) — the remaining MCH Record Book sections, each its own table.

## Referrals & sharing

- **`Referral`** — `fromFacility` → `toFacility`, or an `externalHospitalName`/`externalHospitalPhone` pair when the destination isn't a registered facility (no staff account there to receive it electronically, so the mother/midwife carries a printed copy instead). Has both a `systemSuggestedPriority` (computed) and the actual `priority`, which a midwife can override with a `nurseOverrideReason` — the system suggests, the clinician decides. `includeHistory`/`includeVitals`/`includeFlags` let the midwife control what's actually shared.
- **`ReferralShare`** — the real access grant: one patient shared with one specific doctor, with an `expiresAt` (default 48 hours) and `isActive`. **Checked server-side on every read, not just at creation** — an expired or deactivated share stops granting access immediately, even though the row stays for audit purposes.
- **`PartnerLink`** — a mother's revocable share link. Deliberately not a full account by itself (no login) — using it creates/activates a `PARTNER`-role `User` row. Only one active link per patient at a time; generating a new one revokes the previous one.

## Labs, messaging, alerts

- **`LabRequest`** (`LabRequestStatus`: `REQUESTED → IN_PROGRESS → READY`/`CANCELLED`) / **`LabResult`** — who requested, who completed, free-text `eta` while in progress (e.g. "Ready in 20 min" — not a computed countdown).
- **`Conversation`** / **`Message`** — in-app messaging between staff, and between staff and mothers.
- **`Symptom`**, **`AppointmentRequest`**, **`EmergencyAlert`** — mother-initiated events that fan out notifications to facility staff (see [`workflows-and-clinical-logic.md`](./workflows-and-clinical-logic.md)).

## Notifications & audit

- **`Notification`** — clinical/mother side, one row per recipient `User`.
- **`AdminNotification`** — admin side, one row per recipient `SuperAdmin`. Kept separate from `Notification` because `SuperAdmin` is deliberately not a `User` and shouldn't gain a dependency on that table. (In-app half of the Platform Super Admin's broadcast feature — the SMS half is sent directly via Hubtel and not persisted.)
- **`AuditLog`** — `actorId` (a `User`) *or* `actorLabel` (free text, used when the actor is a `SuperAdmin` — which has no `User` row to reference), optionally scoped to `facilityId` so a Facility Admin's audit view can filter to just their own facility. Platform-level actions (facility created, admin password changes, Facility Admin created) leave `facilityId` null.

## A deliberate omission: no `onDelete: Cascade`

No relation in the schema uses `onDelete: Cascade`. Deleting a `Patient` or a staff `User` requires manually clearing every table that references them first, in dependency order — handled by `lib/staff-cascade-delete.ts`. This is more code, but it means a delete can never silently cascade further than intended through a relation nobody was thinking about when it was added.

**Facility Admin hard-delete and the Audit Log "clear all" are testing-only features** — the project owner's stated intent is to remove or gate them before any real deployment; they exist now to make resetting test data straightforward during coursework development.
