import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMotherDashboardData } from "@/lib/queries/mother-dashboard";
import { formatDate, initials } from "@/lib/utils";
import { BellIcon, BPIcon, CalendarIcon, HeartRateIcon, PartnerIcon, ChevronRightIcon } from "@/components/ui/icons";
import StatCard from "@/components/ui/StatCard";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning,";
  if (hour < 17) return "Good afternoon,";
  return "Good evening,";
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative size-20">
      <svg viewBox="0 0 80 80" className="size-20 -rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#EDD5F9" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#C178E0"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-heading text-base font-bold text-text-primary">{percent}%</span>
      </div>
    </div>
  );
}

export default async function MotherDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const data = await getMotherDashboardData(user.id);
  if (!data) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-body text-sm text-text-secondary">
          No patient record is linked to this account yet. Your midwife needs to register you first.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-col">
      <div className="flex h-40 flex-col justify-end rounded-b-card bg-primary px-6 pb-5 pt-11">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm text-[#6A1F8A]/70">{greeting()}</p>
            <p className="font-heading text-2xl font-bold text-lilac-deeper">{data.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <BellIcon className="size-6 text-lilac-deeper" />
              <span className="absolute -right-0.5 -top-0.5 size-2 rounded-badge bg-pink-accent" />
            </div>
            <div className="flex size-10 items-center justify-center rounded-badge bg-lilac-light">
              <span className="font-heading text-sm font-bold text-lilac-deeper">{initials(data.name)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-5 pt-5">
        {data.pregnancy && (
          <div className="rounded-card bg-white p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-heading text-4xl font-bold text-lilac-dark">Week {data.pregnancy.week}</p>
                <p className="mt-0.5 font-body text-[13px] text-text-secondary">
                  {data.pregnancy.trimester} trimester
                </p>
              </div>
              <ProgressRing percent={data.pregnancy.progressPercent} />
            </div>
            <p className="mt-3 text-center font-body text-xs text-text-secondary">
              {data.pregnancy.weeksToGo} weeks to go
            </p>
          </div>
        )}

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

        <div className="flex items-center gap-4 rounded-card bg-white p-5 shadow-card">
          <div className="flex size-12 items-center justify-center rounded-badge bg-pink-light">
            <PartnerIcon className="size-[22px] text-pink-deep" />
          </div>
          <div className="flex-1">
            <p className="font-heading text-[15px] font-bold text-text-primary">Share with your partner</p>
            <p className="mt-0.5 font-body text-xs text-text-secondary">Keep them involved in your journey</p>
          </div>
          <span className="font-body text-[13px] font-medium text-pink-deep">Set up →</span>
        </div>

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
    </main>
  );
}
