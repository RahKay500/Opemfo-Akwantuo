import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { isPlatformAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import VideosClient from "./VideosClient";

// Not jurisdiction-scoped data in the usual sense — facilityId: null videos
// are genuinely platform-wide (shown to every mother regardless of
// facility), so a Regional/District Admin seeing that same list isn't a
// leak. The isPlatform flag here only picks which subtitle copy to show.
export default async function AdminVideosPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const isPlatform = isPlatformAdmin(session);

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
            mimeType: v.mimeType,
            category: v.category,
            createdAt: v.createdAt.toISOString(),
          }))}
        />
      </div>
    </>
  );
}
