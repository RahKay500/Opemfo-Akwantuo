import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMotherSidebarData } from "@/lib/queries/mother-sidebar";
import MotherIdentityCard from "@/components/ui/MotherIdentityCard";
import SharePartnerForm from "./SharePartnerForm";

export default async function MotherPartnerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const sidebarData = await getMotherSidebarData(user.id);

  return (
    <main className="flex flex-col">
      <div className="px-5 pb-4 pt-14 text-center lg:flex lg:items-center lg:justify-between lg:pb-0 lg:pt-8 lg:text-left">
        <h1 className="font-heading text-xl font-bold text-text-primary lg:text-[28px]">Share with Partner</h1>
        <div className="hidden lg:block">
          <MotherIdentityCard
            name={sidebarData?.name ?? user.name ?? ""}
            week={sidebarData?.week ?? null}
            dueDate={sidebarData?.dueDate?.toISOString() ?? null}
          />
        </div>
      </div>
      <SharePartnerForm />
    </main>
  );
}
