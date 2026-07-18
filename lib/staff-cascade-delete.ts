import { prisma } from "@/lib/prisma";

// No relation in the schema uses onDelete: Cascade, so deleting a Patient or
// staff User requires manually clearing every table that references them
// first, in dependency order (ReferralShare before Referral, since
// ReferralShare itself references Referral).
async function deletePatientCascade(patientId: string): Promise<void> {
  await prisma.referralShare.deleteMany({ where: { patientId } });
  await prisma.referral.deleteMany({ where: { patientId } });
  await prisma.symptom.deleteMany({ where: { patientId } });
  await prisma.appointmentRequest.deleteMany({ where: { patientId } });
  await prisma.emergencyAlert.deleteMany({ where: { patientId } });
  await prisma.vaccination.deleteMany({ where: { patientId } });
  await prisma.iptpDose.deleteMany({ where: { patientId } });
  await prisma.deliveryRecord.deleteMany({ where: { patientId } });
  await prisma.postnatalVisit.deleteMany({ where: { patientId } });
  await prisma.labResult.deleteMany({ where: { patientId } });
  await prisma.partnerLink.deleteMany({ where: { patientId } });
  await prisma.visit.deleteMany({ where: { patientId } });

  const patient = await prisma.patient.findUnique({ where: { id: patientId }, select: { userId: true } });
  await prisma.patient.delete({ where: { id: patientId } });

  // The mother's own mobile-app login account, if she ever activated one —
  // deleted last since Patient.userId references it.
  if (patient?.userId) {
    await prisma.notification.deleteMany({ where: { userId: patient.userId } });
    await prisma.auditLog.deleteMany({ where: { actorId: patient.userId } });
    await prisma.user.delete({ where: { id: patient.userId } });
  }
}

export interface StaffCascadeDeleteResult {
  deletedPatientCount: number;
  staffDeleted: boolean;
  // Set when the staff row itself couldn't be deleted — e.g. they're
  // referenced by a referral/visit belonging to a patient registered by
  // someone else (a doctor who received a share from another facility).
  // Rather than force-deleting data outside the requested scope, the staff
  // account is left in place and this explains why.
  blockedReason?: string;
}

export async function countPatientsRegisteredBy(staffId: string): Promise<number> {
  return prisma.patient.count({ where: { registeredById: staffId } });
}

export async function deleteStaffCascade(staffId: string): Promise<StaffCascadeDeleteResult> {
  const patients = await prisma.patient.findMany({ where: { registeredById: staffId }, select: { id: true } });
  for (const p of patients) {
    await deletePatientCascade(p.id);
  }

  await prisma.notification.deleteMany({ where: { userId: staffId } });
  await prisma.auditLog.deleteMany({ where: { entityType: "User", entityId: staffId } });
  await prisma.auditLog.deleteMany({ where: { actorId: staffId } });

  try {
    await prisma.user.delete({ where: { id: staffId } });
    return { deletedPatientCount: patients.length, staffDeleted: true };
  } catch {
    // Foreign key constraint from data outside this staff member's own
    // registered patients (e.g. a referral for a patient registered by a
    // different staff member). Their own patients are already gone; leave
    // the account itself in place rather than reaching outside scope.
    return {
      deletedPatientCount: patients.length,
      staffDeleted: false,
      blockedReason:
        "This staff member's registered patients were deleted, but the account itself is still referenced by records belonging to other patients (e.g. a referral they were involved in), so it couldn't be removed. Deactivate it instead.",
    };
  }
}
