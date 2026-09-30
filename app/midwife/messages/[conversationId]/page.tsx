import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import MessageThread from "@/components/ui/MessageThread";

export default async function MidwifeThreadPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { conversationId } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { patient: { select: { name: true } }, messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation || conversation.staffId !== user.id) notFound();

  await prisma.conversation.update({ where: { id: conversation.id }, data: { staffLastReadAt: new Date() } });

  return (
    <MessageThread
      target={{ mode: "conversation", conversationId: conversation.id }}
      viewerId={user.id}
      otherPartyName={conversation.patient.name}
      backHref="/midwife/messages"
      initialMessages={conversation.messages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  );
}
