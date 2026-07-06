import SessionKeepAlive from "@/app/_components/SessionKeepAlive";
import DoctorBottomNav from "@/components/ui/DoctorBottomNav";

export default function DoctorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-[#F6F1F8]">
      <SessionKeepAlive />
      <div className="flex-1 pb-20">{children}</div>
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-[430px]">
        <DoctorBottomNav />
      </div>
    </div>
  );
}
