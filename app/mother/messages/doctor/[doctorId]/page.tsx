import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import MessageThread from "@/components/ui/MessageThread";

export default async function MotherDoctorThreadPage({ params }: { params: Promise<{ doctorId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { doctorId } = await params;

  const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
  if (!patient) redirect("/mother/messages");

  const share = await prisma.referralShare.findFirst({
    where: { patientId: patient.id, sharedWithDoctorId: doctorId },
    include: { sharedWithDoctor: { select: { name: true } } },
  });
  if (!share) notFound();

  const conversation = await prisma.conversation.findUnique({
    where: { patientId_staffId: { patientId: patient.id, staffId: doctorId } },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (conversation) {
    await prisma.conversation.update({ where: { id: conversation.id }, data: { motherLastReadAt: new Date() } });
  }

  return (
    <MessageThread
      target={{ mode: "relationship", patientId: patient.id, staffRole: "DOCTOR", staffId: doctorId }}
      viewerId={user.id}
      otherPartyName={share.sharedWithDoctor.name}
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
