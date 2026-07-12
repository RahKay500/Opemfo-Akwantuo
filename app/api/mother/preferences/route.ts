import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { updatePreferencesSchema } from "@/lib/validations/profile";

export async function PATCH(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MOTHER") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updatePreferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({ where: { userId: session.userId } });
  if (!patient) {
    return NextResponse.json({ error: "Patient record not found." }, { status: 404 });
  }

  await prisma.patient.update({
    where: { id: patient.id },
    data: parsed.data,
  });

  return NextResponse.json({ success: true });
}
