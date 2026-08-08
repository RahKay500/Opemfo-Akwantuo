import Avatar from "./Avatar";

// Application Components → Messaging, "Message" component, pulled from
// the Figma design system ("gfgfg" in the Figma MCP), node 1242:996
// (Type=Message/Message reply/File/Audio/Video/Image/Link preview/Link
// minimal/Writing, Sent=True/False, Actions panel=True/False). Only the
// plain "Message" text-bubble type is implemented — this app has no
// file/audio/video/link-preview messaging, so those variants (and the
// hover action panel, reactions, reply-threading) are skipped. Sent vs
// received flips alignment and bubble color (brand-tinted on the right
// for the current user, neutral gray on the left for others), matching
// Figma's asymmetric corner-radius convention (the "pointed" corner sits
// on the sender's side).
export interface MessageBubbleProps {
  text: string;
  senderName?: string;
  timestamp?: string;
  sent?: boolean;
  avatarSrc?: string | null;
  className?: string;
}

export default function MessageBubble({
  text,
  senderName,
  timestamp,
  sent = false,
  avatarSrc,
  className,
}: MessageBubbleProps) {
  return (
    <div className={`flex w-full items-start gap-3 ${sent ? "flex-row-reverse" : ""} ${className ?? ""}`}>
      {senderName && <Avatar name={senderName} src={avatarSrc} size="md" online className="shrink-0" />}
      <div className={`flex min-w-0 max-w-[360px] flex-col gap-1.5 ${sent ? "items-end" : "items-start"}`}>
        {(senderName || timestamp) && (
          <div className={`flex items-center gap-2 ${sent ? "flex-row-reverse" : ""}`}>
            {senderName && <p className="font-body text-sm font-medium text-gray-700">{senderName}</p>}
            {timestamp && <p className="font-body text-xs text-gray-600">{timestamp}</p>}
          </div>
        )}
        <div
          className={`w-full px-3 py-2 font-body text-md ${
            sent
              ? "rounded-bl-lg rounded-br-none rounded-tl-lg rounded-tr-lg bg-brand-600 text-white"
              : "rounded-bl-none rounded-br-lg rounded-tl-lg rounded-tr-lg border border-gray-200 bg-gray-50 text-gray-900"
          }`}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
