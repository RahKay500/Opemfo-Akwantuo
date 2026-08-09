import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { calculatePregnancyProgress } from "@/lib/pregnancy";
import VideosClient from "./VideosClient";

export default async function MotherVideosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const patient = await prisma.patient.findUnique({ where: { userId: user.id }, select: { lmp: true } });
  const currentWeek = patient?.lmp ? calculatePregnancyProgress(patient.lmp).week : 0;

  return (
    <main className="flex flex-col">
      <div className="px-5 pb-4 pt-14 text-center lg:mx-5 lg:mt-8 lg:rounded-card lg:bg-white lg:px-6 lg:py-5 lg:pb-5 lg:pt-5 lg:text-left lg:shadow-card">
        <h1 className="font-heading text-xl font-bold text-text-primary lg:text-[28px]">Learn &amp; Prepare</h1>
      </div>
      <VideosClient currentWeek={currentWeek} />
    </main>
  );
}
