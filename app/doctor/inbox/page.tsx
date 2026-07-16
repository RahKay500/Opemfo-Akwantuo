import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getDoctorInbox } from "@/lib/queries/doctor-inbox";
import { getDoctorPatientDetail } from "@/lib/queries/doctor-patient-detail";
import { getOtherDoctors } from "@/lib/queries/doctor-directory";
import { getDoctorSidebarData } from "@/lib/queries/doctor-sidebar";
import { cn, initials } from "@/lib/utils";
import InboxClient from "./InboxClient";
import PatientRecordPanel from "./PatientRecordPanel";

export default async function DoctorInboxPage({
  searchParams,
}: {
  searchParams: Promise<{ patientId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { patientId: requestedPatientId } = await searchParams;
  const shares = await getDoctorInbox(user.id);
  const selectedPatientId = requestedPatientId ?? shares[0]?.patientId ?? null;
  const pendingCount = shares.filter((s) => s.status === "Active").length;

  const [detail, otherDoctors, sidebarData] = await Promise.all([
    selectedPatientId ? getDoctorPatientDetail(selectedPatientId, user.id) : null,
    getOtherDoctors(user.id),
    getDoctorSidebarData(user.id),
  ]);

  return (
    <main className="flex flex-col">
      <div className="relative flex flex-col justify-end rounded-b-3xl bg-primary px-6 pb-5 pt-11 lg:hidden">
        <p className="font-heading text-[22px] font-bold text-white">Patient Records</p>
        <p className="mt-1 font-body text-[13px] text-white">Records shared with you</p>
      </div>
      <div className="lg:hidden">
        <InboxClient shares={shares} />
      </div>

      <div className="hidden items-center justify-between px-5 pt-8 lg:flex">
        <div>
          <h1 className="font-heading text-[28px] font-bold text-text-primary">Patient Records</h1>
          <p className="mt-1 font-body text-sm text-text-secondary">{sidebarData?.facilityName ?? ""}</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="rounded-badge bg-pink-light px-3 py-1.5 font-body text-[13px] font-bold text-pink-deep">
              {pendingCount} shared record{pendingCount === 1 ? "" : "s"} pending review
            </span>
          )}
          <div className="flex size-10 items-center justify-center rounded-badge bg-lilac-light">
            <span className="font-heading text-xs font-bold text-lilac-deeper">{initials(sidebarData?.name ?? "")}</span>
          </div>
        </div>
      </div>

      <div className="hidden items-start gap-6 px-5 pb-8 pt-5 lg:flex">
        <div className="w-[340px] shrink-0 rounded-card bg-white p-4 shadow-card">
          <h2 className="px-2 pb-3 font-heading text-lg font-bold text-text-primary">Shared Records</h2>
          <div className="flex flex-col">
            {shares.length === 0 && (
              <p className="px-2 py-6 font-body text-sm text-text-secondary">No records shared with you yet.</p>
            )}
            {shares.map((s) => (
              <Link
                key={s.id}
                href={`/doctor/inbox?patientId=${s.patientId}`}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-input border-l-4 px-3 py-3.5",
                  s.patientId === selectedPatientId
                    ? "border-lilac-mid bg-lilac-light"
                    : "border-transparent hover:bg-surface/60"
                )}
              >
                <div className="min-w-0">
                  <p className="truncate font-heading text-[15px] font-bold text-text-primary">{s.patientName}</p>
                  <p className="truncate font-body text-xs text-text-secondary">
                    {s.facilityName} · {s.status === "Active" && new Date(s.createdAt).toDateString() === new Date().toDateString() ? "Today" : new Date(s.createdAt).toLocaleDateString("en-GH", { day: "numeric", month: "short" })}
                    {" · "}
                    {new Date(s.createdAt).toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit", hour12: false })}
                  </p>
                </div>
                {s.status === "Active" && <span className="size-2 shrink-0 rounded-badge bg-pink-accent" />}
              </Link>
            ))}
          </div>
        </div>

        {detail ? (
          <PatientRecordPanel
            shareId={detail.share.id}
            patientName={detail.patient.name}
            sharedByName={detail.share.sharedByNurse.name}
            facilityName={detail.patient.facility.name}
            reason={detail.share.reason}
            doctorNotes={detail.share.doctorNotes}
            createdAt={detail.share.createdAt.toISOString()}
            status={detail.status}
            bpTrend={detail.bpTrend}
            latestVitals={
              detail.latestVisit
                ? {
                    systolic: detail.latestVisit.systolic,
                    diastolic: detail.latestVisit.diastolic,
                    weight: detail.latestVisit.weight,
                    fetalHeartRate: detail.latestVisit.fetalHeartRate,
                  }
                : null
            }
            otherDoctors={otherDoctors}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-card bg-white p-10 shadow-card">
            <p className="font-body text-sm text-text-secondary">Select a record to view details.</p>
          </div>
        )}
      </div>
    </main>
  );
}
