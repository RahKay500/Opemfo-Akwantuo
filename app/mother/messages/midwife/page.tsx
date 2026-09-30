import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import MessageThread from "@/components/ui/MessageThread";

export default async function MotherMidwifeThreadPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const patient = await prisma.patient.findUnique({
    where: { userId: user.id },
    include: { registeredBy: { select: { id: true, name: true } } },
  });
  if (!patient) redirect("/mother/messages");

  const conversation = await prisma.conversation.findUnique({
    where: { patientId_staffId: { patientId: patient.id, staffId: patient.registeredById } },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (conversation) {
    await prisma.conversation.update({ where: { id: conversation.id }, data: { motherLastReadAt: new Date() } });
  }

  return (
    <MessageThread
      target={{ mode: "relationship", patientId: patient.id, staffRole: "MIDWIFE", staffId: patient.registeredById }}
      viewerId={user.id}
      otherPartyName={patient.registeredBy.name}
      backHref="/mother/messages"
      initialMessages={(conversation?.messages ?? []).map((m) => ({
        id: m.id,
        senderId: m.senderId,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  );
}
