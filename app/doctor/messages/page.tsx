import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getStaffConversations } from "@/lib/queries/staff-conversations";
import StaffMessagesListClient from "@/components/ui/StaffMessagesListClient";

export default async function DoctorMessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const conversations = await getStaffConversations(user.id, "DOCTOR");

  return (
    <main className="flex flex-col">
      <div className="flex flex-col justify-end rounded-b-3xl bg-primary px-6 pb-5 pt-11 lg:hidden">
        <p className="font-heading text-[22px] font-bold text-white">Messages</p>
      </div>

      <div className="hidden rounded-card bg-white px-6 py-5 border border-border-color lg:mx-5 lg:mt-8 lg:block">
        <h1 className="font-heading text-[28px] font-bold text-text-primary">Messages</h1>
      </div>

      <StaffMessagesListClient conversations={conversations} hrefBase="/doctor/messages" />
    </main>
  );
}
