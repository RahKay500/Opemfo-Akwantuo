import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/current-admin";
import Header from "@/components/admin/Header";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function AdminSettingsPage() {
  if (!(await isSuperAdmin())) redirect("/admin/login");

  return (
    <>
      <Header title="Settings" />
      <div className="px-8 py-6">
        <ChangePasswordForm />
      </div>
    </>
  );
}
