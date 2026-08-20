import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import VideosClient from "./VideosClient";

export default async function AdminVideosPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const isPlatform = session.facilityId === null;

  const videos = await prisma.video.findMany({
    where: { facilityId: session.facilityId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header
        title="Learn & Prepare Videos"
        subtitle={
          isPlatform
            ? "Shown to every mother, alongside the app's own curated list"
            : "Shown only to mothers registered at your facility"
        }
      />
      <div className="px-4 py-6 lg:px-8">
        <VideosClient
          videos={videos.map((v) => ({
            id: v.id,
            title: v.title,
            url: v.url,
            category: v.category,
            createdAt: v.createdAt.toISOString(),
          }))}
        />
      </div>
    </>
  );
}
