# Workflows & clinical logic

## Core end-to-end workflows

1. **Registration** — a midwife registers the mother; the mother self-activates her own account by phone (OTP).
2. **Visit** — vitals are logged (`patients/[id]/visits`) and checked against the thresholds below; a flag surfaces on the midwife's dashboard.
3. **Laboratory** — midwife or doctor requests a test → lab technician processes it (`Pending → In Progress → Ready`) → completing with a result notifies the whole care team.
4. **Referral** — midwife initiates; the system computes a suggested priority, which the midwife can override with a reason; sent to a registered facility or logged against an external one. The full record is shared with the receiving doctor for 48 hours via `ReferralShare`, then access expires automatically — checked server-side on every read, not just at creation.
5. **Emergency** — a mother/partner triggers an alert; every active midwife at her registered facility is notified.
6. **Partner sharing** — a mother generates a revocable link from her profile; using it creates/activates a read-only `PARTNER` account scoped to what she chose to share.

## Clinical flagging (`lib/flagging.ts`)

Vitals are checked against published thresholds at the moment they're logged. **Flags support clinical judgement — they do not diagnose.** A flag means one recorded value crossed a threshold; the clinician still decides what it means.

| Vital | High | Critical | Source |
| --- | --- | --- | --- |
| Systolic BP | ≥140 mmHg | ≥160 mmHg | ISSHP guidelines (Magee et al., 2022) |
| Diastolic BP | ≥90 mmHg | ≥110 mmHg | ISSHP guidelines (Magee et al., 2022) |
| Fetal heart rate | outside 110–160 bpm | — | FIGO guidelines (Ayres-de-Campos et al., 2015) |
| Temperature | >38°C | — | — |

Thresholds are fixed system-wide (`THRESHOLDS` in `lib/flagging.ts`), not yet configurable per facility or administrator — see the Future Work note in `security-privacy-and-testing.md`.

## Referral priority: suggested vs. actual

A `Referral` carries both `systemSuggestedPriority` (computed from the patient's flags/vitals) and `priority` (what actually gets sent). A midwife can override the suggestion, recording why in `nurseOverrideReason`. The system proposes; the clinician decides — the same philosophy as vital flagging.

## Notifications

Notification `type` values and what triggers them (`lib/notifications.ts` holds the shared icon/color/label mapping used by the staff-facing notification screens):

| Type | Triggered by |
| --- | --- |
| `REFERRAL` | Referral status changes |
| `APPOINTMENT` | Appointment request created/confirmed/declined |
| `VITALS` | A logged visit crosses a flagging threshold |
| `LAB_RESULT` | A lab request is marked `READY` — notifies the other midwives/doctors with an active share for that patient (not the requester's own facility blindly — scoped to who actually has access) |
| `LAB_REQUEST` | A new lab request is created — notifies the facility's lab technicians |
| `ANNOUNCEMENT` | Staff broadcast |
| `RECORD_SHARE` | A `ReferralShare` is created for a doctor |
| `EMERGENCY` | A mother/partner emergency alert — every active midwife at the patient's facility (`role: "MIDWIFE", isActive: true` at `patient.facilityId`) |
| `SYMPTOM` | A mother reports a symptom |

`Notification` (clinical/mother) reads and mark-read are **role-agnostic** — the generic `notifications`/`notifications/[id]` routes are keyed purely by the session's `userId`, with no role-specific branching, so the same backend serves every role's notification list. `AdminNotification` is the separate admin-side equivalent (see `data-model.md`).

**SMS/email are not connected to a live provider.** The notification data model, fan-out logic, and in-app UI (bell, badges, per-role lists) are fully built; what's missing is only the final hop to a real Hubtel SMS account or SMTP/Resend email — locally, and in the current deployment, both log to console instead of sending. This was a deliberate scope decision to avoid real message sends to real-looking phone numbers during coursework development — see `security-privacy-and-testing.md`.
