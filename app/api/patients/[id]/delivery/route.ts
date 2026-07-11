import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { deliveryRecordSchema } from "@/lib/validations/delivery";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MIDWIFE" || !session.facilityId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = deliveryRecordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({ where: { id: params.id } });
  if (!patient || patient.facilityId !== session.facilityId) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  const { dateOfDelivery, ...rest } = parsed.data;
  const deliveryDate = dateOfDelivery ? new Date(dateOfDelivery) : undefined;

  const data = {
    ...rest,
    dateOfDelivery: deliveryDate,
    recordedById: session.userId,
  };

  const record = await prisma.$transaction(async (tx) => {
    const created = await tx.deliveryRecord.upsert({
      where: { patientId: patient.id },
      create: { patientId: patient.id, ...data },
      update: data,
    });
    if (deliveryDate) {
      await tx.patient.update({ where: { id: patient.id }, data: { deliveryDate } });
    }
    return created;
  });

  await logAudit({
    actorId: session.userId,
    action: "DELIVERY_RECORDED",
    entityType: "DeliveryRecord",
    entityId: record.id,
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ record });
}
