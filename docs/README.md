# Documentation index

Full technical documentation for Ɔpemfoɔ Akwantuo. The top-level [`README.md`](../README.md) covers quick setup, checks, and environment variables — start there to run the project. These docs go deeper, for anyone extending, reviewing, or defending the system.

| Doc | Covers |
| --- | --- |
| [`architecture.md`](./architecture.md) | Tech stack, project layout, request flow, deployment, scheduled jobs |
| [`data-model.md`](./data-model.md) | The full Prisma schema, grouped by domain, with the reasoning behind non-obvious design choices |
| [`roles-and-access-control.md`](./roles-and-access-control.md) | The 5 clinical/patient roles, the separate 4-tier admin hierarchy, and how access control is actually enforced |
| [`api-reference.md`](./api-reference.md) | Every API route, grouped by area, with what it does and who can call it |
| [`workflows-and-clinical-logic.md`](./workflows-and-clinical-logic.md) | The core end-to-end workflows (registration → visit → referral → …), clinical flagging thresholds and their sources, and the notification fan-out rules |
| [`security-privacy-and-testing.md`](./security-privacy-and-testing.md) | Auth internals, rate limiting, audit logging, data protection, known limitations, and how testing/CI work |

## One-paragraph summary

Ɔpemfoɔ Akwantuo digitizes Ghana's MCH (Maternal and Child Health) Record Book into a role-based web application. A Midwife registers mothers and logs vitals; a Doctor (shown in the UI as "Gynaecologist") receives referrals and time-limited shared records; a Lab Technician processes test requests; a Mother sees her own record and can share it with a Partner via a revocable link. A separate four-tier Admin hierarchy (Platform / Regional / District / Facility) manages facilities and staff accounts but never sees clinical data. Built with Next.js 14 (App Router) and PostgreSQL via Prisma, deployed on Vercel.
