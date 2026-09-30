import { prisma } from "@/lib/prisma";

// Lightweight count for the sidebar badge — only real Conversation rows are
// relevant, since a "virtual" (not-yet-started) thread can have no unread
// messages by definition.
export async function getMotherUnreadMessageCount(userId: string): Promise<number> {
  const patient = await prisma.patient.findUnique({ where: { userId }, select: { id: true } });
  if (!patient) return 0;

  const conversations = await prisma.conversation.findMany({
    where: { patientId: patient.id },
    select: { motherLastReadAt: true, messages: { select: { senderId: true, createdAt: true } } },
  });
  return conversations.filter((c) =>
    c.messages.some((m) => m.senderId !== userId && (!c.motherLastReadAt || m.createdAt > c.motherLastReadAt))
  ).length;
}

export interface MotherConversationSummary {
  staffId: string;
  staffName: string;
  conversationId: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface MotherConversations {
  midwife: MotherConversationSummary;
  doctors: MotherConversationSummary[];
}

// Merges the mother's fixed midwife relationship (always present) and her
// ReferralShare doctor history (zero or more) with any Conversation rows
// that already exist, so she sees "Message your midwife"/"Message Dr. X"
// even before either thread has a single message in it yet.
export async function getMotherConversations(userId: string): Promise<MotherConversations | null> {
  const patient = await prisma.patient.findUnique({
    where: { userId },
    include: { registeredBy: { select: { id: true, name: true } } },
  });
  if (!patient) return null;

  const [shares, conversations] = await Promise.all([
    prisma.referralShare.findMany({
      where: { patientId: patient.id },
      distinct: ["sharedWithDoctorId"],
      include: { sharedWithDoctor: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.conversation.findMany({
      where: { patientId: patient.id },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          select: { senderId: true, body: true, createdAt: true },
        },
      },
    }),
  ]);

  const conversationByStaffId = new Map(conversations.map((c) => [c.staffId, c]));

  function summarize(staffId: string, staffName: string): MotherConversationSummary {
    const conversation = conversationByStaffId.get(staffId);
    const lastMessage = conversation?.messages[0] ?? null;
    const unreadCount = conversation
      ? conversation.messages.filter(
          (m) => m.senderId !== userId && (!conversation.motherLastReadAt || m.createdAt > conversation.motherLastReadAt)
        ).length
      : 0;
    return {
      staffId,
      staffName,
      conversationId: conversation?.id ?? null,
      lastMessage: lastMessage?.body ?? null,
      lastMessageAt: lastMessage?.createdAt.toISOString() ?? null,
      unreadCount,
    };
  }

  return {
    midwife: summarize(patient.registeredById, patient.registeredBy.name),
    doctors: shares.map((s) => summarize(s.sharedWithDoctorId, s.sharedWithDoctor.name)),
  };
}
