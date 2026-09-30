import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMotherConversations } from "@/lib/queries/mother-conversations";
import { formatRelativeTime } from "@/lib/utils";
import { ChevronRightIcon, MidwifeIcon, DoctorIcon } from "@/components/ui/icons";

export default async function MotherMessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const conversations = await getMotherConversations(user.id);
  if (!conversations) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 p-6 text-center">
        <p className="font-body text-sm text-text-secondary">
          No patient record is linked to this account yet.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-col">
      <div className="px-5 pb-4 pt-14 lg:mx-5 lg:mt-8 lg:rounded-card lg:bg-white lg:px-6 lg:py-5 lg:border border-border-color">
        <h1 className="font-heading text-xl font-bold text-text-primary lg:text-[28px]">Messages</h1>
      </div>

      <div className="flex flex-col gap-3 px-5 pb-8 pt-4">
        <p className="font-body text-xs font-medium uppercase tracking-[0.06em] text-text-secondary">Your Midwife</p>
        <ConversationRow
          href="/mother/messages/midwife"
          name={conversations.midwife.staffName}
          Icon={MidwifeIcon}
          lastMessage={conversations.midwife.lastMessage}
          lastMessageAt={conversations.midwife.lastMessageAt}
          unreadCount={conversations.midwife.unreadCount}
        />

        <p className="mt-2 font-body text-xs font-medium uppercase tracking-[0.06em] text-text-secondary">Doctors</p>
        {conversations.doctors.length === 0 && (
          <p className="font-body text-sm text-text-secondary">
            You&apos;ll be able to message a doctor here once your midwife shares your record with one.
          </p>
        )}
        {conversations.doctors.map((d) => (
          <ConversationRow
            key={d.staffId}
            href={`/mother/messages/doctor/${d.staffId}`}
            name={d.staffName}
            Icon={DoctorIcon}
            lastMessage={d.lastMessage}
            lastMessageAt={d.lastMessageAt}
            unreadCount={d.unreadCount}
          />
        ))}
      </div>
    </main>
  );
}

function ConversationRow({
  href,
  name,
  Icon,
  lastMessage,
  lastMessageAt,
  unreadCount,
}: {
  href: string;
  name: string;
  Icon: typeof MidwifeIcon;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-card bg-white p-4 border border-border-color">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-badge bg-lilac-light text-lilac-deeper">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-heading text-sm font-bold text-text-primary">{name}</p>
          {lastMessageAt && (
            <span className="shrink-0 font-body text-[11px] text-[#9CA3AF]">{formatRelativeTime(lastMessageAt)}</span>
          )}
        </div>
        <p className="mt-0.5 truncate font-body text-[13px] text-text-secondary">
          {lastMessage ?? "Tap to start the conversation"}
        </p>
      </div>
      {unreadCount > 0 && (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-badge bg-pink-deep font-body text-[11px] font-bold text-white">
          {unreadCount}
        </span>
      )}
      <ChevronRightIcon className="size-3.5 shrink-0 text-[#9CA3AF]" />
    </Link>
  );
}
