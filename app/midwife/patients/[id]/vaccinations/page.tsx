import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { calculatePregnancyProgress } from "@/lib/pregnancy";
import { ArrowLeftIcon } from "@/components/ui/icons";
import LogVaccinationForm from "./LogVaccinationForm";

export default async function LogVaccinationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || !user.facilityId) redirect("/login");

  const { id } = await params;
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient || patient.facilityId !== user.facilityId) notFound();

  const week = patient.lmp ? calculatePregnancyProgress(patient.lmp).week : null;

  return (
    <main className="flex min-h-screen flex-col bg-[#F6F1F8]">
      <div className="flex items-center gap-4 border-b border-border-color bg-white px-6 pb-[17px] pt-11">
        <Link href={`/midwife/patients/${patient.id}`} className="flex size-[22px] items-center justify-center">
          <ArrowLeftIcon className="size-[22px] text-text-primary" />
        </Link>
        <h1 className="flex-1 text-center font-heading text-lg font-bold text-text-primary">Log Vaccination</h1>
        <div className="size-[22px]" />
      </div>

      <div className="flex items-center justify-between bg-lilac-light px-5 py-4">
        <p className="font-heading text-[15px] font-bold text-text-primary">
          {patient.name}
          {week != null ? ` · Week ${week}` : ""}
        </p>
      </div>

      <LogVaccinationForm patientId={patient.id} week={week} />
    </main>
  );
}
