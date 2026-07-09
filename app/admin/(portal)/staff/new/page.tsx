import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/current-admin";
import Header from "@/components/admin/Header";
import NewStaffForm from "./NewStaffForm";

export default async function NewStaffPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (session.facilityId === null) redirect("/admin/dashboard");

  return (
    <>
      <Header title="Add Staff" />
      <div className="px-4 py-6 lg:px-8">
        <NewStaffForm />
      </div>
    </>
  );
}
