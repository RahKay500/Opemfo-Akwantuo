"use client";

import { useEffect, useRef, useState } from "react";
import { EmergencyBellIcon } from "@/components/ui/icons";
import { formatRelativeTime } from "@/lib/utils";

interface AdminNotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNotifications(data.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  function handleToggle() {
    setOpen((o) => !o);
    if (!open && unreadCount > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      fetch("/api/admin/notifications", { method: "PATCH" }).catch(() => {});
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        // h-14 matches HeaderIdentityMenu's rendered height (a 40px avatar
        // plus its py-2 padding) so the two buttons sit flush in the header
        // row instead of the bell looking short next to the identity pill.
        className="relative flex h-14 w-11 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white/60 backdrop-blur-md transition-colors hover:bg-white/80"
      >
        <EmergencyBellIcon className="size-5 text-[#1A1A2E]" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#DC2626]" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-72 rounded-md border border-[#E2E8F0] bg-white py-1 shadow-lg">
          {notifications.length === 0 && (
            <p className="px-3.5 py-4 text-center text-sm text-[#6B7280]">No notifications yet.</p>
          )}
          {notifications.map((n) => (
            <div key={n.id} className="border-b border-[#E2E8F0] px-3.5 py-2.5 last:border-0">
              <p className="text-sm font-semibold text-[#1A1A2E]">{n.title}</p>
              <p className="mt-0.5 text-sm text-[#6B7280]">{n.message}</p>
              <p className="mt-1 text-xs text-[#9CA3AF]">{formatRelativeTime(n.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
