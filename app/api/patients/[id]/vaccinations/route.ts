import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { logVaccinationSchema } from "@/lib/validations/vaccinations";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MIDWIFE" || !session.facilityId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = logVaccinationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({ where: { id: params.id } });
  if (!patient || patient.facilityId !== session.facilityId) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  const { category, doseNumber, dateGiven, batchNumber, gestationalAge } = parsed.data;

  if (category === "IPTP") {
    const dose = await prisma.iptpDose.create({
      data: {
        patientId: patient.id,
        doseNumber,
        dateGiven: new Date(dateGiven),
        gestationalAge,
      },
    });

    await logAudit({
      actorId: session.userId,
      action: "IPTP_DOSE_LOGGED",
      entityType: "IptpDose",
      entityId: dose.id,
      ipAddress: request.headers.get("x-forwarded-for"),
    });

    return NextResponse.json({ dose });
  }

  const vaccination = await prisma.vaccination.create({
    data: {
      patientId: patient.id,
      type: category === "TD" ? "TD" : "Deworming",
      doseNumber,
      dateGiven: new Date(dateGiven),
      batchNumber,
      gestationalAge,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: "VACCINATION_LOGGED",
    entityType: "Vaccination",
    entityId: vaccination.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ vaccination });
}
