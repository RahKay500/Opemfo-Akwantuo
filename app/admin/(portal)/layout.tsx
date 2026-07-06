import Sidebar from "@/components/admin/Sidebar";

export default function AdminPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen min-w-[1024px] bg-[#F8FAFC] font-body text-[#1A1A2E]">
      <Sidebar />
      <div className="flex-1 overflow-x-auto">{children}</div>
    </div>
  );
}
