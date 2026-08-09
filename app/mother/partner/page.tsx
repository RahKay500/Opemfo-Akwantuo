import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import SharePartnerForm from "./SharePartnerForm";

export default async function MotherPartnerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="flex flex-col">
      <div className="px-5 pb-4 pt-14 text-center lg:pb-0 lg:pt-8 lg:text-left">
        <h1 className="font-heading text-xl font-bold text-text-primary lg:text-[28px]">Share with Partner</h1>
      </div>
      <SharePartnerForm />
    </main>
  );
}
