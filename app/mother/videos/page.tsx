import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { calculatePregnancyProgress } from "@/lib/pregnancy";
import type { VideoCategory } from "@/lib/videos";
import VideosClient from "./VideosClient";
import type { VideoItem } from "./videos-data";

export default async function MotherVideosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const patient = await prisma.patient.findUnique({
    where: { userId: user.id },
    select: { lmp: true, facilityId: true },
  });
  const currentWeek = patient?.lmp ? calculatePregnancyProgress(patient.lmp).week : 0;

  // A facility's own videos are more relevant than the global admin-added
  // ones, which in turn are more relevant than the app's fixed curated
  // library — sorted in that order so the most locally-relevant content
  // surfaces first.
  const dbVideos = patient?.facilityId
    ? await prisma.video.findMany({
        where: { OR: [{ facilityId: null }, { facilityId: patient.facilityId }] },
        include: { facility: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const extraVideos: VideoItem[] = dbVideos
    .sort((a, b) => Number(!a.facilityId) - Number(!b.facilityId))
    .map((v) => ({
      id: v.id,
      title: v.title,
      source: v.facility?.name ?? "Ɔpemfoɔ Akwantuo",
      url: v.url,
      category: v.category as VideoCategory,
    }));

  return (
    <main className="flex flex-col">
      <div className="px-5 pb-4 pt-14 text-center lg:mx-5 lg:mt-8 lg:rounded-card lg:bg-white lg:px-6 lg:py-5 lg:pb-5 lg:pt-5 lg:text-left lg:shadow-card">
        <h1 className="font-heading text-xl font-bold text-text-primary lg:text-[28px]">Learn &amp; Prepare</h1>
      </div>
      <VideosClient currentWeek={currentWeek} extraVideos={extraVideos} />
    </main>
  );
}
