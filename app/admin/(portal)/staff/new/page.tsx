import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import { isPlatformAdmin } from "@/lib/admin-auth";
import Header from "@/components/admin/Header";
import NewStaffForm from "./NewStaffForm";

// Regional/District Admin staff management isn't built yet — see
// app/admin/(portal)/staff/page.tsx.
export default async function NewStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ facilityId?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const platform = isPlatformAdmin(session);
  if (!platform && session.facilityId === null) redirect("/admin/dashboard");

  const { facilityId: queryFacilityId } = await searchParams;
  if (platform && !queryFacilityId) redirect("/admin/facilities");

  return (
    <>
      <Header title="Add Staff" />
      <div className="px-4 py-6 lg:px-8">
        <NewStaffForm facilityId={platform ? queryFacilityId : undefined} />
      </div>
    </>
  );
}
