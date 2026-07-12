import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMotherDashboardData } from "@/lib/queries/mother-dashboard";
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

export default async function MotherDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getMotherDashboardData(user.id);
  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-body text-sm text-text-secondary">
          No patient record is linked to this account yet. Your midwife/nurse needs to register you first.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-col">
      <div className="flex flex-col rounded-b-card bg-primary px-6 pb-5 pt-11">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-body text-sm text-white">{greeting()}</p>
            <p className="font-heading text-2xl font-bold text-white">{data.name} 👋</p>
            {data.pregnancy && (
              <p className="mt-1 max-w-xs font-body text-[13px] text-white/85">
                You&apos;re in your {data.pregnancy.trimester.toLowerCase()} trimester — keep up the great work!
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/mother/notifications" className="relative" aria-label="View notifications">
              <BellIcon className="size-6 text-white" />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-badge bg-pink-accent" />
            </Link>
            <Link
              href="/mother/profile"
              className="flex size-10 shrink-0 items-center justify-center rounded-badge bg-lilac-light"
              aria-label="View profile"
            >
              <Image src="/images/logo.png" alt="" width={22} height={22} />
            </Link>
          </div>
        </div>

        {data.pregnancy && (
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex flex-1 gap-2">
              <div className="flex-1 rounded-input bg-white/15 px-3 py-2 text-center">
                <p className="font-heading text-sm font-bold text-white">{data.pregnancy.week}</p>
                <p className="font-body text-[10px] text-white/80">Week</p>
              </div>
              <div className="flex-1 rounded-input bg-white/15 px-3 py-2 text-center">
                <p className="font-heading text-sm font-bold text-white">{data.pregnancy.trimester}</p>
                <p className="font-body text-[10px] text-white/80">Trimester</p>
              </div>
              <div className="flex-1 rounded-input bg-white/15 px-3 py-2 text-center">
                <p className="font-heading text-sm font-bold text-white">
                  {data.dueDate ? formatDate(data.dueDate) : "—"}
                </p>
                <p className="font-body text-[10px] text-white/80">Due Date</p>
              </div>
            </div>
            <ProgressRing percent={data.pregnancy.progressPercent} />
          </div>
        )}
      </div>

      <div className="px-5 pt-5 lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-6">
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
              badge={data.nextAppointment ? { text: "Confirmed", tone: "info" } : undefined}
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

          <SharePartnerCard />

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
                    "block pb-3",
                    i < data.recentNotifications.length - 1 && "border-b border-border-color"
                  )}
                >
                  <p className="font-heading text-[13px] font-bold text-text-primary">{n.title}</p>
                  <p className="mt-0.5 font-body text-xs text-text-secondary">{formatRelativeTime(n.createdAt)}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
