import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { createPartnerLinkSchema } from "@/lib/validations/partner";
import { sendPartnerInviteSms } from "@/lib/hubtel";
import { normalizeGhanaPhone } from "@/lib/utils";

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
    include: { user: { select: { isActive: true } } },
  });

  if (!link) {
    return NextResponse.json({ active: false });
  }
  return NextResponse.json({
    active: true,
    partnerActivated: link.user?.isActive ?? false,
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
    shareProgress,
    shareAppointments,
    shareVitals,
    shareVisitSummaries,
    shareReferralStatus,
    shareMedicalHistory,
  } = parsed.data;

  const phone = normalizeGhanaPhone(partnerPhone);
  if (!phone) {
    return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
  }

  let partnerUser = await prisma.user.findUnique({ where: { phone } });
  if (partnerUser && partnerUser.role !== "PARTNER") {
    return NextResponse.json(
      { error: "This phone number already has an account on Ɔpemfoɔ Akwantuo and can't be invited as a partner." },
      { status: 409 }
    );
  }
  if (partnerUser) {
    const existingLink = await prisma.partnerLink.findFirst({
      where: { userId: partnerUser.id, revokedAt: null },
    });
    if (existingLink && existingLink.patientId !== patient.id) {
      return NextResponse.json(
        { error: "This phone number is already invited or connected as a partner to another account." },
        { status: 409 }
      );
    }
  }

  if (!partnerUser) {
    partnerUser = await prisma.user.create({
      data: { name: partnerName, phone, role: "PARTNER", isActive: false },
    });
  }

  await prisma.partnerLink.updateMany({
    where: { patientId: patient.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  await prisma.partnerLink.create({
    data: {
      patientId: patient.id,
      userId: partnerUser.id,
      partnerName,
      partnerPhone: phone,
      shareProgress,
      shareAppointments,
      shareVitals,
      shareVisitSummaries,
      shareReferralStatus,
      shareMedicalHistory,
    },
  });

  await sendPartnerInviteSms(phone, patient.name);

  return NextResponse.json({ partnerActivated: partnerUser.isActive });
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
