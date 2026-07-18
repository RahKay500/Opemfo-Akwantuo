import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import Header from "@/components/admin/Header";
import NewStaffForm from "./NewStaffForm";

export default async function NewStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ facilityId?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { facilityId: queryFacilityId } = await searchParams;
  if (session.facilityId === null && !queryFacilityId) redirect("/admin/facilities");

  return (
    <>
      <Header title="Add Staff" />
      <div className="px-4 py-6 lg:px-8">
        <NewStaffForm facilityId={session.facilityId === null ? queryFacilityId : undefined} />
      </div>
    </>
  );
}
