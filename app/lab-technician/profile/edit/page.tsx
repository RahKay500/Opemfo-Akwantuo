import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getLabTechnicianProfileData } from "@/lib/queries/lab-technician-profile";
import EditStaffProfileForm from "@/components/ui/EditStaffProfileForm";

export default async function LabTechnicianEditProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getLabTechnicianProfileData(user.id);
  if (!data) redirect("/lab-technician/profile");

  return (
    <EditStaffProfileForm
      backHref="/lab-technician/profile"
      apiPath="/api/lab-technician/profile"
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
