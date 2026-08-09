import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { calculatePregnancyProgress } from "@/lib/pregnancy";
import { getMotherSidebarData } from "@/lib/queries/mother-sidebar";
import MotherIdentityCard from "@/components/ui/MotherIdentityCard";
import VideosClient from "./VideosClient";

export default async function MotherVideosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [patient, sidebarData] = await Promise.all([
    prisma.patient.findUnique({ where: { userId: user.id }, select: { lmp: true } }),
    getMotherSidebarData(user.id),
  ]);
  const currentWeek = patient?.lmp ? calculatePregnancyProgress(patient.lmp).week : 0;

  return (
    <main className="flex flex-col">
      <div className="px-5 pb-4 pt-14 text-center lg:flex lg:items-center lg:justify-between lg:pb-0 lg:pt-8 lg:text-left">
        <h1 className="font-heading text-xl font-bold text-text-primary lg:text-[28px]">Learn &amp; Prepare</h1>
        <div className="hidden lg:block">
          <MotherIdentityCard
            name={sidebarData?.name ?? user.name ?? ""}
            week={sidebarData?.week ?? null}
            dueDate={sidebarData?.dueDate?.toISOString() ?? null}
          />
        </div>
      </div>
      <VideosClient currentWeek={currentWeek} />
    </main>
  );
}
