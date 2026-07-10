import { randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

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
  return NextResponse.json({ active: true, url: `${request.nextUrl.origin}/partner/${link.token}` });
}

export async function POST(request: NextRequest) {
  const patient = await getPatientForSession(request);
  if (!patient) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  await prisma.partnerLink.updateMany({
    where: { patientId: patient.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const token = randomBytes(24).toString("base64url");
  await prisma.partnerLink.create({ data: { patientId: patient.id, token } });

  return NextResponse.json({ url: `${request.nextUrl.origin}/partner/${token}` });
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
