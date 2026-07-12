import SessionKeepAlive from "@/app/_components/SessionKeepAlive";
import MotherBottomNav from "@/components/ui/MotherBottomNav";
import MotherSidebar from "@/components/ui/MotherSidebar";
import { getCurrentUser } from "@/lib/current-user";
import { getMotherSidebarData } from "@/lib/queries/mother-sidebar";

export default async function MotherLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const sidebarData = user ? await getMotherSidebarData(user.id) : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#F6F1F8] lg:flex-row">
      <SessionKeepAlive />
      <div className="hidden lg:block">
        <MotherSidebar
          name={sidebarData?.name ?? user?.name ?? ""}
          week={sidebarData?.week ?? null}
          dueDate={sidebarData?.dueDate?.toISOString() ?? null}
          progressPercent={sidebarData?.progressPercent ?? null}
          unreadCount={sidebarData?.unreadCount ?? 0}
        />
      </div>
      {/* pb clears the fixed 80px MotherBottomNav so bottom-of-page content
          like a submit button is never covered by it. Disappears at lg:,
          where the sidebar takes over instead. */}
      <div className="flex flex-1 justify-center overflow-x-hidden pb-28 lg:overflow-x-auto lg:pb-10">
        <div className="w-full max-w-[430px] lg:max-w-3xl">{children}</div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] lg:hidden">
        <MotherBottomNav />
      </div>
    </div>
  );
}
