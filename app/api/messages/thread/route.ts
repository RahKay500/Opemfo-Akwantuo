import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

// Mother-only: look up a thread by relationship (staffRole, and staffId for
// a gynaecologist) rather than by conversation id, since no Conversation row exists
// until the first message is sent. Also marks the thread read.
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "MOTHER") {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const staffRole = searchParams.get("staffRole");
  const staffIdParam = searchParams.get("staffId");
  if (staffRole !== "MIDWIFE" && staffRole !== "DOCTOR") {
    return NextResponse.json({ error: "Invalid staffRole." }, { status: 400 });
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.userId },
    include: { registeredBy: { select: { name: true } } },
  });
  if (!patient) {
    return NextResponse.json({ error: "Patient record not found." }, { status: 404 });
  }

  let staffId: string;
  let staffName: string;
  if (staffRole === "MIDWIFE") {
    staffId = patient.registeredById;
    staffName = patient.registeredBy.name;
  } else {
    if (!staffIdParam) return NextResponse.json({ error: "Missing staffId." }, { status: 400 });
    const share = await prisma.referralShare.findFirst({
      where: { patientId: patient.id, sharedWithDoctorId: staffIdParam },
      include: { sharedWithDoctor: { select: { name: true } } },
    });
    if (!share) return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    staffId = staffIdParam;
    staffName = share.sharedWithDoctor.name;
  }

  const conversation = await prisma.conversation.findUnique({
    where: { patientId_staffId: { patientId: patient.id, staffId } },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (conversation) {
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { motherLastReadAt: new Date() },
    });
  }

  return NextResponse.json({
    conversationId: conversation?.id ?? null,
    staffId,
    staffName,
    messages: conversation?.messages.map((m) => ({ id: m.id, senderId: m.senderId, body: m.body, createdAt: m.createdAt })) ?? [],
  });
}
