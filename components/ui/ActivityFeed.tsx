import type { ReactNode } from "react";
import Avatar from "./Avatar";

// Application Components → Activity feeds, "_Feed item base" primitive
// (node 1254:127644, Size=sm/md, Supporting item=False/File/Labels/Text,
// Connector=True/False) — pulled from the Figma design system ("gfgfg"
// in the Figma MCP). Only the base row (avatar + connector line + actor
// name + timestamp + description text + optional "new" dot) is
// implemented; the File/Labels/Text "supporting item" attachments are
// skipped — this app's activity sources (admin audit log, future patient
// timelines) are plain text events, not file/label attachments. Renders
// a full connected list from an `items` array rather than exposing a
// single row, since a feed is always a list in practice.
export interface ActivityFeedItemData {
  id: string;
  actorName: string;
  avatarSrc?: string | null;
  timestamp: string;
  description: ReactNode;
  isNew?: boolean;
}

export interface ActivityFeedProps {
  items: ActivityFeedItemData[];
  className?: string;
}

export default function ActivityFeed({ items, className }: ActivityFeedProps) {
  return (
    <div className={`flex w-full flex-col ${className ?? ""}`}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <div key={item.id} className="relative flex w-full items-start gap-3">
            <div className="flex flex-col items-center gap-1.5 self-stretch pb-1.5">
              <Avatar name={item.actorName} src={item.avatarSrc} size="xs" online />
              {!isLast && <div className="w-px flex-1 bg-gray-200" />}
            </div>
            <div className={`flex min-w-0 flex-1 flex-col gap-3 ${isLast ? "" : "pb-8"}`}>
              <div className="flex flex-col items-start">
                <div className="flex w-full items-center gap-2 whitespace-nowrap">
                  <p className="font-body text-sm font-medium text-gray-700">{item.actorName}</p>
                  <p className="font-body text-xs text-gray-600">{item.timestamp}</p>
                </div>
                <p className="w-full font-body text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
            {item.isNew && <span className="absolute right-0 top-0 size-2.5 rounded-full bg-brand-600" />}
          </div>
        );
      })}
    </div>
  );
}
