import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getMidwifeSidebarData } from "@/lib/queries/midwife-sidebar";
import { initials } from "@/lib/utils";
import RegisterPatientForm from "./RegisterPatientForm";

export default async function RegisterPatientPage() {
  const user = await getCurrentUser();
  if (!user || !user.facilityId) redirect("/login");

  const [facility, sidebarData] = await Promise.all([
    prisma.facility.findUnique({ where: { id: user.facilityId } }),
    getMidwifeSidebarData(user.id),
  ]);

  return (
    <main className="flex min-h-screen flex-col bg-[#F6F1F8]">
      <div className="flex items-center justify-center border-b border-border-color bg-white px-6 pb-[17px] pt-11 lg:hidden">
        <h1 className="font-heading text-lg font-bold text-text-primary">Register Patient</h1>
      </div>

      <div className="hidden items-center justify-between px-5 pt-8 lg:flex">
        <div>
          <h1 className="font-heading text-[28px] font-bold text-text-primary">Register Patient</h1>
          <p className="mt-1 font-body text-sm text-text-secondary">{sidebarData?.facilityName ?? ""}</p>
        </div>
        <div className="flex items-center gap-3">
          {sidebarData?.activeEmergency && (
            <span className="flex items-center gap-1.5 rounded-badge bg-critical-bg px-3 py-1.5 font-body text-[13px] font-bold text-critical">
              <span className="size-1.5 rounded-badge bg-critical" />1 Emergency
            </span>
          )}
          <div className="flex size-10 items-center justify-center rounded-badge bg-lilac-light">
            <span className="font-heading text-xs font-bold text-lilac-deeper">{initials(sidebarData?.name ?? "")}</span>
          </div>
        </div>
      </div>

      <RegisterPatientForm facilityName={facility?.name ?? "Your facility"} />
    </main>
  );
}
