import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMidwifeProfileData } from "@/lib/queries/midwife-profile";
import EditStaffProfileForm from "./EditStaffProfileForm";

export default async function MidwifeEditProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getMidwifeProfileData(user.id);
  if (!data) redirect("/midwife/profile");

  return (
    <EditStaffProfileForm
      backHref="/midwife/profile"
      apiPath="/api/midwife/profile"
      initial={{
        name: data.name,
        staffId: data.staffId ?? "",
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString().split("T")[0] : "",
        gender: data.gender ?? "",
        email: data.email ?? "",
        serviceStartDate: data.serviceStartDate ? data.serviceStartDate.toISOString().split("T")[0] : "",
      }}
    />
  );
}
