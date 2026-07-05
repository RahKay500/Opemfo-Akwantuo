import SessionKeepAlive from "@/app/_components/SessionKeepAlive";
import MidwifeBottomNav from "@/components/ui/MidwifeBottomNav";

export default function MidwifeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6F1F8]">
      <SessionKeepAlive />
      <div className="flex-1 pb-20">{children}</div>
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px]">
        <MidwifeBottomNav />
      </div>
    </div>
  );
}
