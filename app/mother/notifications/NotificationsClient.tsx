"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { CheckIcon, CalendarIcon, AlertTriangleIcon, MessageIcon } from "@/components/ui/icons";

export interface NotificationListItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const TABS = ["All", "Referral", "Vitals", "Appointments"] as const;

const TYPE_STYLES: Record<string, { bg: string; color: string; Icon: typeof CheckIcon }> = {
  REFERRAL: { bg: "bg-lilac-light", color: "text-lilac-deeper", Icon: CheckIcon },
  APPOINTMENT: { bg: "bg-lilac-light", color: "text-lilac-deeper", Icon: CalendarIcon },
  VITALS: { bg: "bg-high-bg", color: "text-high", Icon: AlertTriangleIcon },
};

function styleFor(type: string) {
  return TYPE_STYLES[type] ?? { bg: "bg-pink-light", color: "text-pink-deep", Icon: MessageIcon };
}

function matchesTab(type: string, tab: (typeof TABS)[number]) {
  if (tab === "All") return true;
  if (tab === "Appointments") return type === "APPOINTMENT";
  return type === tab.toUpperCase();
}

export default function NotificationsClient({ notifications }: { notifications: NotificationListItem[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [items, setItems] = useState(notifications);
  const [marking, setMarking] = useState(false);

  const filtered = items.filter((n) => matchesTab(n.type, tab));

  async function markAllRead() {
    setMarking(true);
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-border-color bg-white px-5 pb-4 pt-14">
        <div className="relative flex items-center justify-center">
          <h1 className="font-heading text-xl font-bold text-text-primary">Notifications</h1>
          <button
            type="button"
            onClick={markAllRead}
            disabled={marking}
            className="absolute right-0 font-body text-[13px] font-medium text-pink-deep disabled:opacity-60"
          >
            Mark all read
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto px-5 pt-4">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-badge border-[1.5px] px-4 py-2 font-body text-[13px] font-medium",
              tab === t ? "border-primary bg-primary text-white" : "border-border-color bg-white text-text-secondary"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 px-5 pb-8 pt-4">
        {filtered.length === 0 && (
          <p className="py-8 text-center font-body text-sm text-text-secondary">No notifications here.</p>
        )}
        {filtered.map((n) => {
          const { bg, color, Icon } = styleFor(n.type);
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => router.push(`/mother/notifications/${n.id}`)}
              className={cn(
                "flex gap-3 rounded-card bg-white p-4 text-left",
                n.isRead ? "shadow-card" : "border-l-[3px] border-primary shadow-[0px_2px_8px_0px_rgba(110,46,148,0.25)]"
              )}
            >
              <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-badge", bg)}>
                <Icon className={cn("size-[18px]", color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-heading text-sm font-bold leading-tight text-text-primary">{n.title}</p>
                  <span className="shrink-0 font-body text-[11px] text-[#9CA3AF]">
                    {formatRelativeTime(n.createdAt)}
                  </span>
                </div>
                <p className="mt-1 font-body text-[13px] text-text-secondary">{n.message}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
