import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMotherDashboardData } from "@/lib/queries/mother-dashboard";
import { getMotherReferralData } from "@/lib/queries/mother-referral";
import { cn, formatDate, formatRelativeTime } from "@/lib/utils";
import { BellIcon, BPIcon, CalendarIcon, HeartRateIcon, ChevronRightIcon } from "@/components/ui/icons";
import StatCard from "@/components/ui/StatCard";
import ProgressRing from "@/components/ui/ProgressRing";
import SharePartnerCard from "@/components/ui/SharePartnerCard";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
}

const TRIMESTER_ORDINAL: Record<string, string> = { First: "1st", Second: "2nd", Third: "3rd" };

function daysUntil(date: Date): string {
  const days = Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export default async function MotherDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [data, referralData] = await Promise.all([
    getMotherDashboardData(user.id),
    getMotherReferralData(user.id),
  ]);
  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-body text-sm text-text-secondary">
          No patient record is linked to this account yet. Your midwife/nurse needs to register you first.
        </p>
      </main>
    );
  }

  const activeReferral = referralData?.active ?? null;
  const REFERRAL_STEP_LABELS = ["Submitted", "Accepted", "En Route", "Arrived"];

  return (
    <main className="flex flex-col gap-5 lg:px-5 lg:pt-5">
      <div className="flex flex-col rounded-b-card bg-gradient-to-br from-[#E6ADF4] to-[#F4DEFB] px-6 pb-5 pt-11 lg:rounded-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-body text-sm text-[#843FA0]">{greeting()}</p>
            <p className="font-heading text-2xl font-bold text-[#6A1E8A]">{data.name} 👋</p>
            {data.pregnancy && (
              <p className="mt-1 max-w-xs font-body text-[13px] text-[#843FA0]">
                You&apos;re in your {data.pregnancy.trimester.toLowerCase()} trimester — keep up the great work!
              </p>
            )}
          </div>
          {/* Only needed on mobile, where there's no sidebar with an Alerts/Profile nav item to fall back on. */}
          <div className="flex items-center gap-3 lg:hidden">
            <Link href="/mother/notifications" className="relative" aria-label="View notifications">
              <BellIcon className="size-6 text-[#6A1E8A]" />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-badge bg-pink-accent" />
            </Link>
            <Link
              href="/mother/profile"
              className="flex size-10 shrink-0 items-center justify-center rounded-badge bg-white"
              aria-label="View profile"
            >
              <Image src="/images/logo.png" alt="" width={22} height={22} />
            </Link>
          </div>
        </div>

        {data.pregnancy && (
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex flex-1 gap-2">
              <div className="flex-1 rounded-input bg-[#F7E4FB] px-3 py-2 text-center">
                <p className="font-heading text-sm font-bold text-[#6A1E8A]">{data.pregnancy.week}</p>
                <p className="font-body text-[10px] text-[#945BAC]">Week</p>
              </div>
              <div className="flex-1 rounded-input bg-[#F7E4FB] px-3 py-2 text-center">
                <p className="font-heading text-sm font-bold text-[#6A1E8A]">
                  {TRIMESTER_ORDINAL[data.pregnancy.trimester] ?? data.pregnancy.trimester}
                </p>
                <p className="font-body text-[10px] text-[#945BAC]">Trimester</p>
              </div>
              <div className="flex-1 rounded-input bg-[#F7E4FB] px-3 py-2 text-center">
                <p className="font-heading text-sm font-bold text-[#6A1E8A]">
                  {data.dueDate ? formatDate(data.dueDate) : "—"}
                </p>
                <p className="font-body text-[10px] text-[#945BAC]">Due Date</p>
              </div>
            </div>
            <ProgressRing percent={data.pregnancy.progressPercent} showCaption />
          </div>
        )}
      </div>

      <div className="px-5 lg:px-0 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex gap-3">
            <StatCard
              icon={BPIcon}
              iconClassName="text-pink-deep"
              label="Last BP"
              value={data.bp ? `${data.bp.systolic}/${data.bp.diastolic}` : "—"}
              badge={data.bp ? { text: data.bp.isNormal ? "Normal" : "High", tone: "positive" } : undefined}
            />
            <StatCard
              icon={CalendarIcon}
              iconClassName="text-primary"
              label="Next Visit"
              value={data.nextAppointment ? formatDate(data.nextAppointment.date) : "None"}
              badge={data.nextAppointment ? { text: daysUntil(data.nextAppointment.date), tone: "info" } : undefined}
            />
            <StatCard
              icon={HeartRateIcon}
              iconClassName="text-pink-deep"
              label="Baby HR"
              value={data.babyHeartRate ? `${data.babyHeartRate.value} bpm` : "—"}
              badge={
                data.babyHeartRate
                  ? { text: data.babyHeartRate.isNormal ? "Normal" : "Check", tone: "positive" }
                  : undefined
              }
            />
          </div>

          {activeReferral && (
            <div className="rounded-card bg-white p-5 shadow-card">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-[15px] font-bold text-text-primary">Active Referral</h2>
                <Link href="/mother/referral" className="font-body text-[13px] font-medium text-pink-deep">
                  Track →
                </Link>
              </div>
              <div className="mt-2 flex items-start gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-badge bg-pink-deep" />
                <div>
                  <p className="font-heading text-base font-bold text-text-primary">{activeReferral.hospitalName}</p>
                  <p className="mt-0.5 font-body text-[13px] text-text-secondary">
                    {activeReferral.reason} · {activeReferral.status === "ACKNOWLEDGED" ? "Accepted" : activeReferral.status.replace(/_/g, " ")}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-1.5">
                {activeReferral.steps.map((step) => (
                  <div
                    key={step.label}
                    className={cn("h-1.5 flex-1 rounded-badge", step.state !== "pending" ? "bg-lilac-dark" : "bg-lilac-light")}
                  />
                ))}
              </div>
              <div className="mt-1.5 flex gap-1.5">
                {REFERRAL_STEP_LABELS.map((label, i) => (
                  <p
                    key={label}
                    className={cn(
                      "flex-1 text-center font-body text-[10px]",
                      activeReferral.steps[i]?.state !== "pending" ? "font-medium text-lilac-deeper" : "text-text-secondary"
                    )}
                  >
                    {label}
                  </p>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-[17px] font-bold text-text-primary">Recent visits</h2>
              <Link href="/mother/records" className="font-body text-[13px] font-medium text-pink-deep">
                See all
              </Link>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {data.recentVisits.length === 0 && (
                <p className="font-body text-sm text-text-secondary">No visits recorded yet.</p>
              )}
              {data.recentVisits.map((visit) => {
                const date = new Date(visit.date);
                return (
                  <Link
                    key={visit.id}
                    href="/mother/records"
                    className="flex items-center gap-3.5 rounded-card bg-white p-3.5 shadow-card"
                  >
                    <div className="flex size-11 flex-col items-center justify-center rounded-[22px] bg-lilac-light">
                      <span className="font-heading text-base font-bold leading-none text-lilac-deeper">
                        {date.getDate()}
                      </span>
                      <span className="font-body text-[9px] text-lilac-deeper">
                        {date.toLocaleDateString("en-GH", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-heading text-sm font-bold text-text-primary">
                        {visit.visitType === "ANTENATAL" ? "Antenatal Visit" : "Postnatal Visit"}
                      </p>
                      <p className="mt-0.5 font-body text-xs text-text-secondary">
                        Attended by {visit.nurseName}
                      </p>
                    </div>
                    <ChevronRightIcon className="size-4 text-text-secondary" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-6 lg:mt-0">
          <div className="rounded-card bg-white p-5 shadow-card">
            <h2 className="font-heading text-[15px] font-bold text-text-primary">Next Appointment</h2>
            {data.nextAppointment ? (
              <>
                <p className="mt-2 font-heading text-base font-bold text-text-primary">
                  {formatDate(data.nextAppointment.date)}
                </p>
                <p className="mt-0.5 font-body text-[13px] text-text-secondary">
                  {data.nextAppointment.facilityName}
                </p>
              </>
            ) : (
              <p className="mt-2 font-body text-sm text-text-secondary">None scheduled</p>
            )}
            <Link
              href="/mother/book"
              className="mt-4 flex h-11 w-full items-center justify-center rounded-input bg-lilac-light font-heading text-sm font-bold text-lilac-deeper"
            >
              Book another visit
            </Link>
          </div>

          <SharePartnerCard />

          <div className="rounded-card bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-[15px] font-bold text-text-primary">Recent Alerts</h2>
              <Link href="/mother/notifications" className="font-body text-[13px] font-medium text-pink-deep">
                View all
              </Link>
            </div>
            <div className="mt-3 flex flex-col gap-3">
              {data.recentNotifications.length === 0 && (
                <p className="font-body text-sm text-text-secondary">No alerts yet.</p>
              )}
              {data.recentNotifications.map((n, i) => (
                <Link
                  key={n.id}
                  href={`/mother/notifications/${n.id}`}
                  className={cn(
                    "flex items-start justify-between gap-3 pb-3",
                    i < data.recentNotifications.length - 1 && "border-b border-border-color"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-badge",
                        n.isRead ? "border border-text-secondary" : "bg-pink-deep"
                      )}
                    />
                    <p className="font-heading text-[13px] font-bold text-text-primary">{n.title}</p>
                  </div>
                  <p className="shrink-0 font-body text-xs text-text-secondary">{formatRelativeTime(n.createdAt)}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
