import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMyLabRequests } from "@/lib/queries/my-lab-requests";
import MyLabRequestsClient from "@/components/ui/MyLabRequestsClient";

export default async function DoctorLabRequestsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const requests = await getMyLabRequests(user.id);

  return (
    <main className="flex flex-col">
      <div className="flex flex-col justify-end rounded-b-3xl bg-primary px-6 pb-5 pt-11 lg:hidden">
        <p className="font-heading text-[22px] font-bold text-white">My Lab Requests</p>
      </div>

      <div className="hidden rounded-card bg-white px-6 py-5 border border-border-color lg:mx-5 lg:mt-8 lg:block">
        <h1 className="font-heading text-[28px] font-bold text-text-primary">My Lab Requests</h1>
      </div>

      <MyLabRequestsClient requests={requests} patientHrefBase="/doctor/patients" />
    </main>
  );
}
