import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getMotherSidebarData } from "@/lib/queries/mother-sidebar";
import NotificationsClient from "./NotificationsClient";

export default async function MotherNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [notifications, sidebarData] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    getMotherSidebarData(user.id),
  ]);

  return (
    <main className="flex flex-col">
      <NotificationsClient
        notifications={notifications.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          isRead: n.isRead,
          createdAt: n.createdAt.toISOString(),
        }))}
        identity={{
          name: sidebarData?.name ?? user.name ?? "",
          week: sidebarData?.week ?? null,
          dueDate: sidebarData?.dueDate?.toISOString() ?? null,
        }}
      />
    </main>
  );
}
