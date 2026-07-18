import { redirect } from "next/navigation";
import { isSuperAdmin, getCurrentAdminIdentity } from "@/lib/current-admin";
import Header from "@/components/admin/Header";
import AdminSignOutButton from "@/components/admin/AdminSignOutButton";
import ChangePasswordForm from "./ChangePasswordForm";
import ProfileForm from "./ProfileForm";

export default async function AdminSettingsPage() {
  if (!(await isSuperAdmin())) redirect("/admin/login");
  const identity = await getCurrentAdminIdentity();

  return (
    <>
      <Header title="Settings" />
      <div className="flex flex-col gap-4 px-4 py-6 lg:px-8">
        <ProfileForm
          initialName={identity?.name ?? null}
          initialOrgName={identity?.orgName ?? null}
          initialDistrict={identity?.district ?? null}
          initialRegion={identity?.region ?? null}
        />
        <ChangePasswordForm />
        <div className="max-w-md overflow-hidden rounded-lg border border-[#E2E8F0] bg-white lg:hidden">
          <AdminSignOutButton variant="row" />
        </div>
      </div>
    </>
  );
}
