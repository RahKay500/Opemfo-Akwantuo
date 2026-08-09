import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import Header from "@/components/admin/Header";
import BroadcastForm from "./BroadcastForm";

// Platform-only — sends a notice to every active Facility Admin (in-app +
// SMS). See app/api/admin/broadcast/route.ts for delivery.
export default async function AdminBroadcastPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.facilityId !== null) redirect("/admin/dashboard");

  return (
    <>
      <Header title="Broadcast" subtitle="Notify all Facility Admins" />
      <div className="px-4 py-6 lg:px-8">
        <div className="max-w-lg rounded-lg border border-[#E2E8F0] bg-white p-5">
          <BroadcastForm />
        </div>
      </div>
    </>
  );
}
