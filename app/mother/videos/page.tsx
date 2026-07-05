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
      <div className="border-b border-border-color bg-white px-5 pb-4 pt-14 text-center">
        <h1 className="font-heading text-xl font-bold text-text-primary">Learn &amp; Prepare</h1>
      </div>
      <VideosClient currentWeek={currentWeek} />
    </main>
  );
}
