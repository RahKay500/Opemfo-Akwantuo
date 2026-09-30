"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import MessageBubble from "@/components/ui/MessageBubble";
import { ArrowLeftIcon, SendIcon } from "@/components/ui/icons";

export interface ThreadMessage {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export type MessageThreadTarget =
  | { mode: "conversation"; conversationId: string }
  | { mode: "relationship"; patientId: string; staffRole: "MIDWIFE" | "DOCTOR"; staffId: string };

// Polls its own GET endpoint every 8s so an open thread feels roughly live —
// this app has no realtime/websocket infrastructure anywhere else, so this
// is a small, screen-scoped addition rather than a framework-wide change.
const POLL_INTERVAL_MS = 8000;

export default function MessageThread({
  target,
  viewerId,
  otherPartyName,
  initialMessages,
  backHref,
}: {
  target: MessageThreadTarget;
  viewerId: string;
  otherPartyName: string;
  initialMessages: ThreadMessage[];
  backHref: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function fetchLatest() {
    try {
      if (target.mode === "conversation") {
        const res = await fetch(`/api/conversations/${target.conversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } else {
        const params = new URLSearchParams({ staffRole: target.staffRole });
        if (target.staffRole === "DOCTOR") params.set("staffId", target.staffId);
        const res = await fetch(`/api/messages/thread?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      }
    } catch {
      // Silent — just skip this poll tick and try again next interval.
    }
  }

  useEffect(() => {
    const interval = setInterval(fetchLatest, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSend() {
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    setError(null);
    try {
      const payload: Record<string, unknown> =
        target.mode === "conversation"
          ? { conversationId: target.conversationId, body }
          : {
              patientId: target.patientId,
              staffRole: target.staffRole,
              staffId: target.staffRole === "DOCTOR" ? target.staffId : undefined,
              body,
            };
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      setDraft("");
      await fetchLatest();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 bg-white px-5 pb-3.5 pt-14 border-b border-border-color">
        <Link href={backHref} className="flex size-[22px] items-center justify-center">
          <ArrowLeftIcon className="size-[22px] text-text-primary" />
        </Link>
        <h1 className="flex-1 truncate font-heading text-lg font-bold text-text-primary">{otherPartyName}</h1>
        <div className="size-[22px]" />
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
          <p className="py-8 text-center font-body text-sm text-text-secondary">
            No messages yet. Say hello to {otherPartyName}.
          </p>
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            text={m.body}
            sent={m.senderId === viewerId}
            senderName={m.senderId === viewerId ? undefined : otherPartyName}
            timestamp={formatRelativeTime(m.createdAt)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-5 pb-2 font-body text-sm text-[#DC2626]">{error}</p>}

      <div className="flex items-center gap-2.5 border-t border-border-color bg-white px-5 py-3.5 pb-6">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="h-12 flex-1 rounded-input border-[1.5px] border-border-color bg-white px-4 font-body text-sm text-text-primary outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !draft.trim()}
          aria-label="Send message"
          className="flex size-12 shrink-0 items-center justify-center rounded-input bg-primary text-white disabled:opacity-60"
        >
          <SendIcon className="size-5" />
        </button>
      </div>
    </div>
  );
}
