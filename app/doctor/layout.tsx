import { getCurrentUser } from "@/lib/current-user";
import LogoutButton from "@/components/ui/LogoutButton";
import SessionKeepAlive from "@/app/_components/SessionKeepAlive";

export default async function DoctorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col bg-white">
      <SessionKeepAlive />
      {/* Temporary Phase 1-2 header — replaced by BottomNav in Phase 5 */}
      <div className="flex items-center justify-between border-b border-border-color px-4 py-3">
        <span className="font-body text-sm text-text-secondary">Hi, {user?.name ?? "Doctor"}</span>
        <LogoutButton />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
