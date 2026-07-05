import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMotherProfileData } from "@/lib/queries/mother-profile";
import EditProfileForm from "./EditProfileForm";

export default async function MotherEditProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getMotherProfileData(user.id);
  if (!data) redirect("/mother/profile");

  return (
    <EditProfileForm
      initial={{
        name: data.name,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth.toISOString().split("T")[0],
        bloodGroup: data.bloodGroup ?? "",
        emergencyContactName: data.emergencyContactName ?? "",
        emergencyContactPhone: data.emergencyContactPhone ?? "",
      }}
    />
  );
}
