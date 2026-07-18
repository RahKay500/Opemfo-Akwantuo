export interface VideoItem {
  id: string;
  title: string;
  duration: string;
  source: string;
  url: string;
  category: "Pregnancy" | "Nutrition" | "Labour" | "Postnatal" | "Baby Care";
}

// Every url below points to a real, published video from an identifiable
// health institution — verified via YouTube's oEmbed endpoint (confirms the
// video exists and returns its real title/channel) plus the page's own
// embedded metadata (confirms runtime). None of these are Ghana Health
// Service's own content; `source` names the actual publisher.
export const FEATURED_VIDEO: VideoItem = {
  id: "pre-eclampsia",
  title: "Pre-eclampsia & Eclampsia: Causes, Symptoms & Treatment",
  duration: "6 min",
  source: "Osmosis from Elsevier",
  url: "https://www.youtube.com/watch?v=CRhGx8A7Dqg",
  category: "Pregnancy",
};

export const VIDEOS: VideoItem[] = [
  { id: "healthy-eating", title: "Nutrition During Pregnancy", duration: "4 min", source: "Stanford Center for Health Education", url: "https://www.youtube.com/watch?v=0BrxCY89_uQ", category: "Nutrition" },
  { id: "antenatal-visits", title: "Antenatal 1 — Health in Pregnancy", duration: "14 min", source: "South Tyneside & Sunderland NHS Foundation Trust", url: "https://www.youtube.com/watch?v=aRaiEkhhM54", category: "Pregnancy" },
  { id: "warning-signs", title: "Danger Signs During Pregnancy", duration: "4 min", source: "Stanford Center for Health Education", url: "https://www.youtube.com/watch?v=qFfQvnedYAk", category: "Pregnancy" },
  { id: "preparing-labour", title: "Antenatal 2 — Preparing for Labour and Delivery", duration: "32 min", source: "South Tyneside & Sunderland NHS Foundation Trust", url: "https://www.youtube.com/watch?v=k1mGGSRwGvw", category: "Labour" },
  { id: "breastfeeding", title: "Breastfeeding and Relationship Building", duration: "6 min", source: "UNICEF UK Baby Friendly Initiative", url: "https://www.youtube.com/watch?v=BR2QZ4WsE10", category: "Postnatal" },
  { id: "first-weeks", title: "Meeting Baby for the First Time", duration: "5 min", source: "UNICEF UK Baby Friendly Initiative", url: "https://www.youtube.com/watch?v=0vzW9qPz3So", category: "Baby Care" },
];

export const CATEGORIES = ["All", "Pregnancy", "Nutrition", "Labour", "Postnatal", "Baby Care"] as const;
