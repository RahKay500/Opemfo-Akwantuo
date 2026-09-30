import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { sendMessageSchema } from "@/lib/validations/messages";
import { resolveConversation } from "@/lib/conversations";

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = sendMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const resolved = await resolveConversation(session, parsed.data);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const message = await prisma.message.create({
    data: { conversationId: resolved.id, senderId: session.userId, body: parsed.data.body },
  });
  await prisma.conversation.update({ where: { id: resolved.id }, data: { updatedAt: new Date() } });

  const patient = await prisma.patient.findUnique({
    where: { id: resolved.patientId },
    select: { userId: true, name: true },
  });

  const recipientId = session.role === "MOTHER" ? resolved.staffId : (patient?.userId ?? null);
  if (recipientId) {
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: "MESSAGE",
        title: session.role === "MOTHER" ? `New message from ${patient?.name ?? "a patient"}` : "New message",
        message: parsed.data.body.slice(0, 140),
        relatedId: resolved.id,
        relatedType: "Conversation",
      },
    });
  }

  await logAudit({
    actorId: session.userId,
    action: "MESSAGE_SENT",
    entityType: "Message",
    entityId: message.id,
    metadata: { conversationId: resolved.id },
    ipAddress: request.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ conversationId: resolved.id, message });
}
