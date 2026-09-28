import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { setNextVisitOverrideSchema } from "@/lib/validations/next-visit-override";
import { getDoctorPatientDetail } from "@/lib/queries/doctor-patient-detail";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "DOCTOR") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = setNextVisitOverrideSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const detail = await getDoctorPatientDetail(params.id, session.userId);
  if (!detail) {
    return NextResponse.json({ error: "Patient not found." }, { status: 404 });
  }

  const nextVisitDate = parsed.data.nextVisitDate ? new Date(parsed.data.nextVisitDate) : null;

  const patient = await prisma.patient.update({
    where: { id: params.id },
    data: {
      doctorNextVisitOverride: nextVisitDate,
      doctorNextVisitOverrideById: nextVisitDate ? session.userId : null,
    },
  });

  await logAudit({
    actorId: session.userId,
    action: nextVisitDate ? "NEXT_VISIT_OVERRIDDEN" : "NEXT_VISIT_OVERRIDE_CLEARED",
    entityType: "Patient",
    entityId: patient.id,
    metadata: { nextVisitDate: nextVisitDate?.toISOString() ?? null },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ patient });
}
