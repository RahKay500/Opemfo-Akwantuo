import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getReferralPrintData } from "@/lib/queries/referral-print";
import { formatDate } from "@/lib/utils";
import { calculateAge } from "@/lib/pregnancy";
import PrintButton from "./PrintButton";

export default async function ReferralPrintPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getReferralPrintData(params.id);
  if (!data) redirect("/login");

  const { referral, latestVisit, flaggedVisits, pregnancy } = data;

  const authorized =
    (user.role === "MIDWIFE" && referral.initiatedById === user.id) ||
    (user.role === "MOTHER" && referral.patient.userId === user.id) ||
    (user.role === "DOCTOR" && referral.toFacilityId === user.facilityId);
  if (!authorized) redirect("/login");

  const destinationName = referral.toFacility?.name ?? referral.externalHospitalName ?? "";
  const destinationPhone = referral.toFacility?.phone ?? referral.externalHospitalPhone ?? null;
  const destinationLocation = referral.toFacility ? `${referral.toFacility.district}, ${referral.toFacility.region}` : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 print:px-0 print:py-0">
      <div className="flex items-center justify-between print:hidden">
        <p className="font-body text-sm text-text-secondary">Referral Letter</p>
        <PrintButton />
      </div>

      <div className="mt-6 rounded-card border border-border-color bg-white p-8 shadow-card print:mt-0 print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-center justify-between border-b border-border-color pb-4">
          <div>
            <p className="font-heading text-lg font-bold text-text-primary">Ɔpemfoɔ Akwantuo</p>
            <p className="font-body text-xs text-text-secondary">Patient Referral Letter</p>
          </div>
          <div className="text-right">
            <p className="font-body text-xs text-text-secondary">Sent</p>
            <p className="font-body text-sm font-medium text-text-primary">{formatDate(referral.sentAt)}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-5">
          <div>
            <p className="font-body text-[11px] font-medium uppercase tracking-wide text-text-secondary">From</p>
            <p className="mt-1 font-body text-sm font-bold text-text-primary">{referral.fromFacility.name}</p>
            <p className="font-body text-xs text-text-secondary">
              {referral.fromFacility.district}, {referral.fromFacility.region}
            </p>
            {referral.fromFacility.phone && (
              <p className="font-body text-xs text-text-secondary">{referral.fromFacility.phone}</p>
            )}
            <p className="mt-1.5 font-body text-xs text-text-secondary">Referred by {referral.initiatedBy.name}</p>
          </div>
          <div>
            <p className="font-body text-[11px] font-medium uppercase tracking-wide text-text-secondary">To</p>
            <p className="mt-1 font-body text-sm font-bold text-text-primary">{destinationName}</p>
            {destinationLocation && <p className="font-body text-xs text-text-secondary">{destinationLocation}</p>}
            {destinationPhone && <p className="font-body text-xs text-text-secondary">{destinationPhone}</p>}
            {!referral.toFacility && (
              <p className="mt-1.5 font-body text-xs text-lilac-deeper">Outside network — hand-carry this letter</p>
            )}
          </div>
        </div>

        <div className="mt-5 border-t border-border-color pt-5">
          <p className="font-body text-[11px] font-medium uppercase tracking-wide text-text-secondary">Patient</p>
          <div className="mt-1.5 grid grid-cols-2 gap-x-5 gap-y-1 font-body text-sm text-text-primary">
            <p>
              <span className="text-text-secondary">Name: </span>
              {referral.patient.name}
            </p>
            <p>
              <span className="text-text-secondary">Age: </span>
              {calculateAge(referral.patient.dateOfBirth)} years
            </p>
            <p>
              <span className="text-text-secondary">Phone: </span>
              {referral.patient.phone}
            </p>
            {pregnancy && (
              <p>
                <span className="text-text-secondary">Gestation: </span>
                Week {pregnancy.week} ({pregnancy.trimester} trimester)
              </p>
            )}
            {referral.patient.bloodGroup && (
              <p>
                <span className="text-text-secondary">Blood group: </span>
                {referral.patient.bloodGroup}
              </p>
            )}
            {(referral.patient.gravida != null || referral.patient.para != null) && (
              <p>
                <span className="text-text-secondary">Gravida/Para: </span>
                {referral.patient.gravida ?? "—"} / {referral.patient.para ?? "—"}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 border-t border-border-color pt-5">
          <p className="font-body text-[11px] font-medium uppercase tracking-wide text-text-secondary">
            Priority — {referral.priority.charAt(0) + referral.priority.slice(1).toLowerCase()}
          </p>
          <p className="mt-1.5 font-body text-sm text-text-primary">{referral.reason}</p>
          {referral.additionalNotes && (
            <p className="mt-2 font-body text-sm text-text-secondary">{referral.additionalNotes}</p>
          )}
          {referral.transportMethod && (
            <p className="mt-2 font-body text-xs text-text-secondary">Transport: {referral.transportMethod}</p>
          )}
        </div>

        {referral.includeVitals && latestVisit && (
          <div className="mt-5 border-t border-border-color pt-5">
            <p className="font-body text-[11px] font-medium uppercase tracking-wide text-text-secondary">
              Latest Vitals — {formatDate(latestVisit.createdAt)}
            </p>
            <div className="mt-1.5 grid grid-cols-2 gap-x-5 gap-y-1 font-body text-sm text-text-primary">
              {latestVisit.systolic != null && latestVisit.diastolic != null && (
                <p>
                  <span className="text-text-secondary">BP: </span>
                  {latestVisit.systolic}/{latestVisit.diastolic}
                </p>
              )}
              {latestVisit.fetalHeartRate != null && (
                <p>
                  <span className="text-text-secondary">Fetal HR: </span>
                  {latestVisit.fetalHeartRate} bpm
                </p>
              )}
              {latestVisit.temperature != null && (
                <p>
                  <span className="text-text-secondary">Temp: </span>
                  {latestVisit.temperature}°C
                </p>
              )}
              {latestVisit.weight != null && (
                <p>
                  <span className="text-text-secondary">Weight: </span>
                  {latestVisit.weight}kg
                </p>
              )}
            </div>
          </div>
        )}

        {referral.includeFlags && flaggedVisits.length > 0 && (
          <div className="mt-5 border-t border-border-color pt-5">
            <p className="font-body text-[11px] font-medium uppercase tracking-wide text-text-secondary">
              Flag History
            </p>
            <div className="mt-1.5 flex flex-col gap-1.5">
              {flaggedVisits.map((v) => (
                <p key={v.id} className="font-body text-sm text-text-primary">
                  <span className="text-text-secondary">{formatDate(v.createdAt)} — </span>
                  {v.flagReason ?? "Flagged for review"}
                </p>
              ))}
            </div>
          </div>
        )}

        {referral.includeHistory && referral.patient.knownConditions && (
          <div className="mt-5 border-t border-border-color pt-5">
            <p className="font-body text-[11px] font-medium uppercase tracking-wide text-text-secondary">
              Known Conditions
            </p>
            <p className="mt-1.5 font-body text-sm text-text-primary">{referral.patient.knownConditions}</p>
          </div>
        )}

        <div className="mt-5 border-t border-border-color pt-5">
          <p className="font-body text-[11px] font-medium uppercase tracking-wide text-text-secondary">
            Emergency Contact
          </p>
          <p className="mt-1.5 font-body text-sm text-text-primary">
            {referral.patient.emergencyContactName ?? "Not provided"}
            {referral.patient.emergencyContactPhone ? ` · ${referral.patient.emergencyContactPhone}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
