import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getDoctorProfileData } from "@/lib/queries/doctor-profile";
import EditStaffProfileForm from "@/components/ui/EditStaffProfileForm";

export default async function DoctorEditProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getDoctorProfileData(user.id);
  if (!data) redirect("/doctor/profile");

  return (
    <EditStaffProfileForm
      backHref="/doctor/profile"
      apiPath="/api/doctor/profile"
      showSpecialty
      initial={{
        name: data.name,
        specialty: data.specialty ?? "",
        staffId: data.staffId ?? "",
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString().split("T")[0] : "",
        gender: data.gender ?? "",
        email: data.email ?? "",
        serviceStartDate: data.serviceStartDate ? data.serviceStartDate.toISOString().split("T")[0] : "",
      }}
    />
  );
}
