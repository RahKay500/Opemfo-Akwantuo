import { redirect } from "next/navigation";
import { isSuperAdmin, getCurrentAdminIdentity } from "@/lib/current-admin";
import Header from "@/components/admin/Header";
import ChangePasswordForm from "./ChangePasswordForm";
import ProfileForm from "./ProfileForm";
import SettingsTabs from "./SettingsTabs";

export default async function AdminSettingsPage() {
  if (!(await isSuperAdmin())) redirect("/admin/login");
  const identity = await getCurrentAdminIdentity();
  const isPlatform = identity?.facilityId === null;

  return (
    <>
      <Header title="Settings" />
      <div className="flex flex-col gap-4 px-4 py-6 lg:px-8">
        <SettingsTabs
          accent={isPlatform ? "#9F1AB1" : "#2663EB"}
          profile={
            <ProfileForm
              initialName={identity?.name ?? null}
              initialOrgName={identity?.orgName ?? null}
              initialDistrict={identity?.district ?? null}
              initialRegion={identity?.region ?? null}
              isPlatform={isPlatform}
            />
          }
          password={<ChangePasswordForm />}
        />
      </div>
    </>
  );
}
