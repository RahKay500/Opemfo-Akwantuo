import { prisma } from "@/lib/prisma";

// Resolves (or creates) the Conversation a message/action belongs to,
// enforcing the same access rules everywhere they're needed: a mother can
// only message her own registering midwife (Patient.registeredById) or a
// doctor who has (or has had) a ReferralShare on her record; a midwife/doctor
// can only message a patient they're actually allowed to see.
export async function resolveConversation(
  session: { userId: string; role: string },
  input: { conversationId?: string; patientId?: string; staffRole?: "MIDWIFE" | "DOCTOR"; staffId?: string }
): Promise<{ id: string; patientId: string; staffId: string } | { error: string; status: number }> {
  if (input.conversationId) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: input.conversationId },
      include: { patient: { select: { userId: true } } },
    });
    if (!conversation) return { error: "Conversation not found.", status: 404 };

    const isParticipant =
      (session.role === "MOTHER" && conversation.patient.userId === session.userId) ||
      (session.role !== "MOTHER" && conversation.staffId === session.userId);
    if (!isParticipant) return { error: "Not authorized.", status: 403 };
    return { id: conversation.id, patientId: conversation.patientId, staffId: conversation.staffId };
  }

  if (session.role === "MOTHER") {
    const patient = await prisma.patient.findUnique({ where: { userId: session.userId } });
    if (!patient) return { error: "Patient record not found.", status: 404 };

    let staffId: string;
    if (input.staffRole === "MIDWIFE") {
      staffId = patient.registeredById;
    } else {
      if (!input.staffId) return { error: "Choose a doctor.", status: 400 };
      const share = await prisma.referralShare.findFirst({
        where: { patientId: patient.id, sharedWithDoctorId: input.staffId },
      });
      if (!share) return { error: "Not authorized.", status: 403 };
      staffId = input.staffId;
    }

    const conversation = await prisma.conversation.upsert({
      where: { patientId_staffId: { patientId: patient.id, staffId } },
      update: {},
      create: { patientId: patient.id, staffId, staffRole: input.staffRole! },
    });
    return { id: conversation.id, patientId: conversation.patientId, staffId: conversation.staffId };
  }

  if (session.role === "MIDWIFE" || session.role === "DOCTOR") {
    if (!input.patientId) return { error: "Missing patient.", status: 400 };
    const patient = await prisma.patient.findUnique({ where: { id: input.patientId } });
    if (!patient) return { error: "Patient not found.", status: 404 };

    if (session.role === "MIDWIFE") {
      if (patient.registeredById !== session.userId) return { error: "Not authorized.", status: 403 };
    } else {
      const share = await prisma.referralShare.findFirst({
        where: { patientId: patient.id, sharedWithDoctorId: session.userId },
      });
      if (!share) return { error: "Not authorized.", status: 403 };
    }

    const conversation = await prisma.conversation.upsert({
      where: { patientId_staffId: { patientId: patient.id, staffId: session.userId } },
      update: {},
      create: { patientId: patient.id, staffId: session.userId, staffRole: session.role },
    });
    return { id: conversation.id, patientId: conversation.patientId, staffId: conversation.staffId };
  }

  return { error: "Not authorized.", status: 403 };
}
