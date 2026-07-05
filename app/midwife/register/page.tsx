import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import RegisterPatientForm from "./RegisterPatientForm";

export default async function RegisterPatientPage() {
  const user = await getCurrentUser();
  if (!user || !user.facilityId) redirect("/login");

  const facility = await prisma.facility.findUnique({ where: { id: user.facilityId } });

  return (
    <main className="flex min-h-screen flex-col bg-[#F6F1F8]">
      <div className="flex items-center justify-center border-b border-border-color bg-white px-6 pb-[17px] pt-11">
        <h1 className="font-heading text-lg font-bold text-text-primary">Register Patient</h1>
      </div>
      <RegisterPatientForm facilityName={facility?.name ?? "Your facility"} />
    </main>
  );
}
