import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Runs once daily (see vercel.json's crons entry). Reminds mothers whose
// next appointment falls tomorrow — matching the same "next appointment"
// logic the dashboard already uses: a midwife-set Visit.nextVisitDate takes
// precedence over the mother's own AppointmentRequest booking.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const now = new Date();
  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

  const [midwifeSet, motherBooked] = await Promise.all([
    prisma.visit.findMany({
      where: { nextVisitDate: { gte: tomorrowStart, lt: tomorrowEnd } },
      include: { patient: { include: { facility: { select: { name: true } } } } },
    }),
    prisma.appointmentRequest.findMany({
      where: { status: "CONFIRMED", preferredDate: { gte: tomorrowStart, lt: tomorrowEnd } },
      include: { patient: { include: { facility: { select: { name: true } } } } },
    }),
  ]);

  // A patient can appear in both sources (e.g. a midwife also confirmed her
  // own booking request) — the midwife-set date wins, same as the dashboard,
  // so drop any motherBooked entries whose patient already has a
  // midwife-set reminder going out.
  const midwifeSetPatientIds = new Set(midwifeSet.map((v) => v.patientId));
  const reminders = [
    ...midwifeSet.map((v) => ({
      patient: v.patient,
      sourceId: v.id,
      date: v.nextVisitDate!,
    })),
    ...motherBooked
      .filter((a) => !midwifeSetPatientIds.has(a.patientId))
      .map((a) => ({ patient: a.patient, sourceId: a.id, date: a.preferredDate })),
  ];

  let sent = 0;
  for (const reminder of reminders) {
    const { patient, sourceId, date } = reminder;
    if (!patient.userId || !patient.notifyAppointments) continue;

    const alreadySent = await prisma.notification.findFirst({
      where: { userId: patient.userId, relatedType: "AppointmentReminder", relatedId: sourceId },
    });
    if (alreadySent) continue;

    await prisma.notification.create({
      data: {
        userId: patient.userId,
        type: "APPOINTMENT",
        title: "Appointment tomorrow",
        message: `You have an appointment at ${patient.facility.name} tomorrow, ${date.toLocaleDateString("en-GH", { weekday: "long", day: "numeric", month: "short" })}.`,
        relatedId: sourceId,
        relatedType: "AppointmentReminder",
      },
    });
    sent += 1;
  }

  return NextResponse.json({ success: true, checked: reminders.length, sent });
}
