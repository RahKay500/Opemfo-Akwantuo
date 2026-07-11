import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ArrowLeftIcon, AlertTriangleIcon } from "@/components/ui/icons";

const PRIORITY_LABEL: Record<string, string> = {
  CRITICAL: "Urgent",
  HIGH: "Urgent",
  MEDIUM: "Follow up",
  LOW: "Informational",
};

export default async function MotherAlertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== user.id) notFound();

  if (!notification.isRead) {
    await prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  let visitDetail: { systolic: number | null; diastolic: number | null; flagReason: string | null; flagPriority: string | null; nurseName: string; nursePhone: string } | null = null;

  if (notification.type === "VITALS" && notification.relatedType === "Visit" && notification.relatedId) {
    const visit = await prisma.visit.findUnique({
      where: { id: notification.relatedId },
      include: { nurse: { select: { name: true, phone: true } } },
    });
    if (visit) {
      visitDetail = {
        systolic: visit.systolic,
        diastolic: visit.diastolic,
        flagReason: visit.flagReason,
        flagPriority: visit.flagPriority,
        nurseName: visit.nurse.name,
        nursePhone: visit.nurse.phone,
      };
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#F6F1F8]">
      <div className="flex items-center gap-2 bg-white px-4 pb-3.5 pt-[50px] shadow-[0px_1px_3px_0px_rgba(110,46,148,0.12)]">
        <Link href="/mother/notifications" className="flex size-7 items-center justify-center">
          <ArrowLeftIcon className="size-[22px] text-text-primary" />
        </Link>
        <h1 className="flex-1 text-center font-heading text-lg font-bold text-text-primary">Alert</h1>
        <div className="size-7" />
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-6 pt-5">
        {visitDetail ? (
          <>
            <div className="flex gap-3.5 rounded-card border-l-4 border-[#EF4444] bg-critical-bg p-[18px] shadow-card">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-badge bg-[#FEE2E2]">
                <AlertTriangleIcon className="size-6 text-critical" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="flex-1 font-heading text-[17px] font-bold text-text-primary">{notification.title}</p>
                  <span className="shrink-0 rounded-badge bg-[#FEE2E2] px-2 py-[3px] font-body text-[10px] font-medium text-critical">
                    {PRIORITY_LABEL[visitDetail.flagPriority ?? "MEDIUM"]}
                  </span>
                </div>
                <p className="mt-1.5 font-body text-xs text-text-secondary">
                  Recorded {formatDate(notification.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 rounded-card bg-white p-[18px] shadow-card">
              <p className="font-heading text-[15px] font-bold text-text-primary">What this means</p>
              <p className="font-body text-sm leading-[22px] text-[#4B5563]">
                {visitDetail.systolic && visitDetail.diastolic
                  ? `Your blood pressure reading of ${visitDetail.systolic}/${visitDetail.diastolic} mmHg is higher than normal. `
                  : ""}
                High blood pressure during pregnancy can be a sign of pre-eclampsia and needs to be checked by a
                health worker soon.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 rounded-card bg-white p-[18px] shadow-card">
              <p className="font-heading text-[15px] font-bold text-text-primary">Recommended action</p>
              {[
                `Contact your midwife/nurse ${visitDetail.nurseName} today`,
                "Rest and avoid stress until you are seen",
                "Go to the nearest facility if you feel headache, blurred vision or swelling",
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-badge bg-[#9CA3AF]" />
                  <p className="flex-1 font-body text-sm leading-[21px] text-[#4B5563]">{tip}</p>
                </div>
              ))}
            </div>

            <a
              href={`tel:${visitDetail.nursePhone}`}
              className="flex h-[54px] items-center justify-center rounded-card bg-lilac-dark font-heading text-base font-bold text-white"
            >
              Call My Midwife/Nurse
            </a>
          </>
        ) : (
          <div className="flex flex-col gap-2.5 rounded-card bg-white p-[18px] shadow-card">
            <p className="font-heading text-[17px] font-bold text-text-primary">{notification.title}</p>
            <p className="font-body text-xs text-text-secondary">{formatDate(notification.createdAt)}</p>
            <p className="mt-1 font-body text-sm leading-[22px] text-[#4B5563]">{notification.message}</p>
          </div>
        )}
      </div>
    </main>
  );
}
