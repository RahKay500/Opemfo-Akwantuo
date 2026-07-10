import SessionKeepAlive from "@/app/_components/SessionKeepAlive";
import MidwifeBottomNav from "@/components/ui/MidwifeBottomNav";
import MidwifeSidebar from "@/components/ui/MidwifeSidebar";

export default function MidwifeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6F1F8] lg:flex-row">
      <SessionKeepAlive />
      <div className="hidden lg:block">
        <MidwifeSidebar />
      </div>
      <div className="flex flex-1 justify-center overflow-x-hidden pb-20 lg:overflow-x-auto lg:pb-10">
        <div className="w-full max-w-[430px] lg:max-w-3xl">{children}</div>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px] lg:hidden">
        <MidwifeBottomNav />
      </div>
    </div>
  );
}
