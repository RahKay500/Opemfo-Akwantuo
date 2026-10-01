import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import StaffNotificationsClient from "@/components/ui/StaffNotificationsClient";

export default async function LabTechnicianNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="flex flex-col">
      <StaffNotificationsClient
        basePath="/lab-technician/notifications"
        notifications={notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
