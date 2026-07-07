import Sidebar from "@/components/admin/Sidebar";
import AdminBottomNav from "@/components/admin/AdminBottomNav";

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC] font-body text-[#1A1A2E] lg:flex-row">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex-1 overflow-x-hidden pb-16 lg:overflow-x-auto lg:pb-0">{children}</div>
      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
        <AdminBottomNav />
      </div>
    </div>
  );
}
