// Shared YouTube URL helpers — used both by the mother-facing player and by
// admin video management, since a Facility Admin can paste any real-world
// YouTube URL shape (watch?v=, youtu.be share links, or an /embed/ link),
// not just the watch?v= format the app's own curated list happens to use.
export function youtubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.pathname.startsWith("/embed/")) return u.pathname.split("/embed/")[1]?.split("/")[0] || null;
    if (u.hostname.replace(/^www\./, "") === "youtube.com" || u.hostname.replace(/^www\./, "") === "m.youtube.com") {
      return u.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

export function isYoutubeUrl(url: string): boolean {
  return youtubeVideoId(url) !== null;
}

export function youtubeThumbnail(url: string): string {
  return `https://i.ytimg.com/vi/${youtubeVideoId(url)}/hqdefault.jpg`;
}

// autoplay=1 starts playback the moment the player opens (a click already
// expressed clear intent, so there's no need to also make her press Play);
// rel=0 keeps YouTube's "related videos" end-screen restricted to this
// channel instead of surfacing unrelated content.
export function youtubeEmbedUrl(url: string): string {
  return `https://www.youtube.com/embed/${youtubeVideoId(url)}?autoplay=1&rel=0`;
}

export const VIDEO_CATEGORIES = ["Pregnancy", "Nutrition", "Labour", "Postnatal", "Baby Care"] as const;
export type VideoCategory = (typeof VIDEO_CATEGORIES)[number];
