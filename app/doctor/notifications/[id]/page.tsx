import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { ArrowLeftIcon } from "@/components/ui/icons";

export default async function DoctorNotificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== user.id) notFound();

  if (!notification.isRead) {
    await prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#F6F1F8]">
      <div className="flex items-center gap-2 bg-white px-4 pb-3.5 pt-[50px] shadow-[0px_1px_3px_0px_rgba(110,46,148,0.12)]">
        <Link href="/doctor/notifications" className="flex size-7 items-center justify-center">
          <ArrowLeftIcon className="size-[22px] text-text-primary" />
        </Link>
        <h1 className="flex-1 text-center font-heading text-lg font-bold text-text-primary">Notification</h1>
        <div className="size-7" />
      </div>

      <div className="flex flex-1 flex-col gap-4 px-5 pb-6 pt-5">
        <div className="flex flex-col gap-2.5 rounded-card bg-white p-[18px] border border-border-color">
          <p className="font-heading text-[17px] font-bold text-text-primary">{notification.title}</p>
          <p className="font-body text-xs text-text-secondary">{formatDate(notification.createdAt)}</p>
          <p className="mt-1 font-body text-sm leading-[22px] text-[#4B5563]">{notification.message}</p>
        </div>
      </div>
    </main>
  );
}
