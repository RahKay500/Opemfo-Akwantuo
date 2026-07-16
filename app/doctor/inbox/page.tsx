import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getDoctorInbox } from "@/lib/queries/doctor-inbox";
import InboxClient from "./InboxClient";

export default async function DoctorInboxPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const shares = await getDoctorInbox(user.id);

  return (
    <main className="flex flex-col">
      <div className="relative flex flex-col justify-end rounded-b-3xl bg-primary px-6 pb-5 pt-11">
        <p className="font-heading text-[22px] font-bold text-white">Patient Records</p>
        <p className="mt-1 font-body text-[13px] text-white">Records shared with you</p>
      </div>
      <InboxClient shares={shares} />
    </main>
  );
}
