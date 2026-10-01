"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { styleFor, NOTIFICATION_TYPE_META } from "@/lib/notifications";
import { BellIcon } from "@/components/ui/icons";
import EmptyState from "@/components/ui/EmptyState";
import Tabs from "@/components/ui/Tabs";

export interface StaffNotificationListItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Shared across Midwife/Doctor/Lab Technician — same list/unread treatment
// as the mother's own notifications screen, but with the tab list derived
// from whichever notification types that role's data actually contains,
// rather than a hardcoded per-role list (staff see a much smaller, less
// predictable mix of types than a mother does).
export default function StaffNotificationsClient({
  notifications,
  basePath,
}: {
  notifications: StaffNotificationListItem[];
  basePath: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(notifications);
  const [marking, setMarking] = useState(false);

  const tabs = useMemo(() => {
    const presentTypes = Array.from(new Set(items.map((n) => n.type)));
    return [
      { key: "All", label: "All" },
      ...presentTypes.map((type) => ({ key: type, label: NOTIFICATION_TYPE_META[type]?.label ?? "Other" })),
    ];
  }, [items]);
  const [tab, setTab] = useState("All");

  const filtered = tab === "All" ? items : items.filter((n) => n.type === tab);

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
      <div className="px-5 pb-4 pt-14 lg:mx-5 lg:mt-8 lg:rounded-card lg:bg-white lg:px-6 lg:py-5 lg:pb-5 lg:pt-5 lg:border border-border-color">
        <div className="relative flex items-center justify-center lg:justify-start">
          <h1 className="font-heading text-xl font-bold text-text-primary lg:text-[28px]">Notifications</h1>
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

      {tabs.length > 2 && (
        <Tabs
          style="pill"
          className="px-5 pt-4"
          tabs={tabs}
          activeKey={tab}
          onChange={setTab}
        />
      )}

      <div className="flex flex-col gap-2 px-5 pb-8 pt-4 lg:grid lg:grid-cols-2 lg:gap-3">
        {filtered.length === 0 && (
          <div className="py-8 lg:col-span-2">
            <EmptyState icon={<BellIcon className="size-6" />} title="No notifications here" />
          </div>
        )}
        {filtered.map((n) => {
          const { bg, color, Icon } = styleFor(n.type);
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => router.push(`${basePath}/${n.id}`)}
              className={cn(
                "flex gap-3 rounded-card bg-white p-4 text-left",
                n.isRead ? "border border-border-color" : "border-l-[3px] border-primary shadow-[0px_2px_8px_0px_rgba(110,46,148,0.25)]"
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
