import { randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { createPartnerLinkSchema } from "@/lib/validations/partner";
import { sendPartnerInviteSms } from "@/lib/hubtel";

async function getPatientForSession(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MOTHER") return null;
  return prisma.patient.findUnique({ where: { userId: session.userId } });
}

export async function GET(request: NextRequest) {
  const patient = await getPatientForSession(request);
  if (!patient) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const link = await prisma.partnerLink.findFirst({
    where: { patientId: patient.id, revokedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!link) {
    return NextResponse.json({ active: false });
  }
  return NextResponse.json({
    active: true,
    url: `${request.nextUrl.origin}/partner/${link.token}`,
    partnerName: link.partnerName,
    partnerPhone: link.partnerPhone,
    permissions: {
      shareProgress: link.shareProgress,
      shareAppointments: link.shareAppointments,
      shareVitals: link.shareVitals,
      shareVisitSummaries: link.shareVisitSummaries,
      shareReferralStatus: link.shareReferralStatus,
      shareMedicalHistory: link.shareMedicalHistory,
    },
  });
}

export async function POST(request: NextRequest) {
  const patient = await getPatientForSession(request);
  if (!patient) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createPartnerLinkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const {
    partnerName,
    partnerPhone,
    sendVia,
    shareProgress,
    shareAppointments,
    shareVitals,
    shareVisitSummaries,
    shareReferralStatus,
    shareMedicalHistory,
  } = parsed.data;

  await prisma.partnerLink.updateMany({
    where: { patientId: patient.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const token = randomBytes(24).toString("base64url");
  await prisma.partnerLink.create({
    data: {
      patientId: patient.id,
      token,
      partnerName,
      partnerPhone,
      shareProgress,
      shareAppointments,
      shareVitals,
      shareVisitSummaries,
      shareReferralStatus,
      shareMedicalHistory,
    },
  });

  const url = `${request.nextUrl.origin}/partner/${token}`;

  if (sendVia === "sms") {
    await sendPartnerInviteSms(partnerPhone, patient.name, url);
  }

  return NextResponse.json({ url });
}

export async function DELETE(request: NextRequest) {
  const patient = await getPatientForSession(request);
  if (!patient) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  await prisma.partnerLink.updateMany({
    where: { patientId: patient.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ active: false });
}
