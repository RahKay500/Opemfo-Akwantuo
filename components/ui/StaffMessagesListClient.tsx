"use client";

import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import type { StaffConversationSummary } from "@/lib/queries/staff-conversations";
import { ChevronRightIcon } from "@/components/ui/icons";

export default function StaffMessagesListClient({
  conversations,
  hrefBase,
}: {
  conversations: StaffConversationSummary[];
  hrefBase: string;
}) {
  return (
    <div className="flex flex-col gap-3 px-5 pb-8 pt-4">
      {conversations.length === 0 && (
        <p className="py-8 text-center font-body text-sm text-text-secondary">No messages yet.</p>
      )}
      {conversations.map((c) => (
        <Link
          key={c.id}
          href={`${hrefBase}/${c.id}`}
          className="flex items-center gap-3 rounded-card bg-white p-4 border border-border-color"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate font-heading text-sm font-bold text-text-primary">{c.patientName}</p>
              <span className="shrink-0 font-body text-[11px] text-[#9CA3AF]">{formatRelativeTime(c.lastMessageAt)}</span>
            </div>
            <p className="mt-0.5 truncate font-body text-[13px] text-text-secondary">{c.lastMessage ?? "No messages yet"}</p>
          </div>
          {c.unreadCount > 0 && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-badge bg-pink-deep font-body text-[11px] font-bold text-white">
              {c.unreadCount}
            </span>
          )}
          <ChevronRightIcon className="size-3.5 shrink-0 text-[#9CA3AF]" />
        </Link>
      ))}
    </div>
  );
}
