import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";

// Midwife/Doctor thread detail — gated to the staff member this conversation
// belongs to. Also marks it read. (Mothers use /api/messages/thread instead,
// since a thread may not have a Conversation row yet.)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(request);
  if (!session || (session.role !== "MIDWIFE" && session.role !== "DOCTOR")) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      patient: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation || conversation.staffId !== session.userId) {
    return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  }

  await prisma.conversation.update({ where: { id: conversation.id }, data: { staffLastReadAt: new Date() } });

  return NextResponse.json({
    id: conversation.id,
    patientId: conversation.patient.id,
    patientName: conversation.patient.name,
    messages: conversation.messages.map((m) => ({ id: m.id, senderId: m.senderId, body: m.body, createdAt: m.createdAt })),
  });
}
