import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { isPlatformAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import BroadcastForm from "./BroadcastForm";

// Platform-only — sends a notice to a chosen audience (Facility Admins,
// staff, or mothers), optionally narrowed to a region/district/facility.
// See app/api/admin/broadcast/route.ts for delivery.
export default async function AdminBroadcastPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!isPlatformAdmin(session)) redirect("/admin/dashboard");

  const regions = await prisma.region.findMany({
    orderBy: { name: "asc" },
    include: {
      districts: {
        orderBy: { name: "asc" },
        include: { facilities: { orderBy: { name: "asc" }, select: { id: true, name: true } } },
      },
    },
  });

  return (
    <>
      <Header title="Broadcast" subtitle="Notify admins, staff, or mothers" />
      <div className="px-4 py-6 lg:px-8">
        <div className="max-w-lg rounded-lg border border-[#E2E8F0] bg-white p-5">
          <BroadcastForm regions={regions} />
        </div>
      </div>
    </>
  );
}
