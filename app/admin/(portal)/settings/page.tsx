import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/current-admin";
import Header from "@/components/admin/Header";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function AdminSettingsPage() {
  if (!(await isSuperAdmin())) redirect("/admin/login");

  return (
    <>
      <Header title="Settings" />
      <div className="flex flex-col gap-4 px-4 py-6 lg:px-8">
        <ChangePasswordForm />
        <div className="max-w-md overflow-hidden rounded-lg border border-[#E2E8F0] bg-white lg:hidden">
          <AdminSignOutButton variant="row" />
        </div>
      </div>
    </>
  );
}
