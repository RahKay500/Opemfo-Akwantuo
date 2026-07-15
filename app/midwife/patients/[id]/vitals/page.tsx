import { redirect } from "next/navigation";

export default async function LogVitalsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/midwife/log-vitals?patientId=${id}`);
}
