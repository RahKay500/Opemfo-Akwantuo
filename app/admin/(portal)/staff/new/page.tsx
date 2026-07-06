import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/current-admin";
import { prisma } from "@/lib/prisma";
import Header from "@/components/admin/Header";
import NewStaffForm from "./NewStaffForm";

export default async function NewStaffPage() {
  if (!(await isSuperAdmin())) redirect("/admin/login");

  const facilities = await prisma.facility.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  return (
    <>
      <Header title="Add Staff" />
      <div className="px-8 py-6">
        <NewStaffForm facilities={facilities.map((f) => ({ id: f.id, name: f.name }))} />
      </div>
    </>
  );
}
