import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMidwifePatientList } from "@/lib/queries/midwife-patients";
import { BellIcon } from "@/components/ui/icons";
import PatientListClient from "./PatientListClient";

export default async function MidwifePatientsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const patients = await getMidwifePatientList(user.id);
  if (!patients) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-body text-sm text-text-secondary">No facility is linked to this account yet.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col">
      <div className="relative flex items-center justify-center border-b border-border-color bg-white px-5 pb-4 pt-14">
        <h1 className="font-heading text-xl font-bold text-text-primary">My Patients</h1>
        <BellIcon className="absolute right-5 size-[22px] text-text-primary" />
      </div>
      <PatientListClient patients={patients} />
    </main>
  );
}
