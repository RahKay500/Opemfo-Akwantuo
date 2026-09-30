import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export interface StaffConversationSummary {
  id: string;
  patientId: string;
  patientName: string;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
}

// A Midwife/Doctor only ever sees conversations that actually exist — unlike
// the mother's view, staff don't need a "potential thread" placeholder per
// patient; the mother (or a "Message" button on the patient record) starts
// the first message.
export async function getStaffConversations(userId: string, role: Role): Promise<StaffConversationSummary[]> {
  const conversations = await prisma.conversation.findMany({
    where: { staffId: userId, staffRole: role },
    orderBy: { updatedAt: "desc" },
    include: {
      patient: { select: { id: true, name: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        select: { senderId: true, body: true, createdAt: true },
      },
    },
  });

  return conversations.map((c) => {
    const lastMessage = c.messages[0] ?? null;
    const unreadCount = c.messages.filter(
      (m) => m.senderId !== userId && (!c.staffLastReadAt || m.createdAt > c.staffLastReadAt)
    ).length;
    return {
      id: c.id,
      patientId: c.patient.id,
      patientName: c.patient.name,
      lastMessage: lastMessage?.body ?? null,
      lastMessageAt: (lastMessage?.createdAt ?? c.createdAt).toISOString(),
      unreadCount,
    };
  });
}

export async function getUnreadConversationCount(userId: string, role: Role): Promise<number> {
  const conversations = await prisma.conversation.findMany({
    where: { staffId: userId, staffRole: role },
    select: {
      staffLastReadAt: true,
      messages: { select: { senderId: true, createdAt: true } },
    },
  });
  return conversations.filter((c) =>
    c.messages.some((m) => m.senderId !== userId && (!c.staffLastReadAt || m.createdAt > c.staffLastReadAt))
  ).length;
}
