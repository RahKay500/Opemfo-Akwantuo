export interface VideoItem {
  id: string;
  title: string;
  duration: string;
  source: string;
  category: "Pregnancy" | "Nutrition" | "Labour" | "Postnatal" | "Baby Care";
}

export const FEATURED_VIDEO: VideoItem = {
  id: "pre-eclampsia",
  title: "Signs of Pre-eclampsia — What to Watch For",
  duration: "8 min",
  source: "Ghana Health Service",
  category: "Pregnancy",
};

export const VIDEOS: VideoItem[] = [
  { id: "healthy-eating", title: "Healthy eating during pregnancy", duration: "5 min", source: "Ghana Health Service", category: "Nutrition" },
  { id: "antenatal-visits", title: "Understanding your antenatal visits", duration: "6 min", source: "Ghana Health Service", category: "Pregnancy" },
  { id: "warning-signs", title: "Warning signs to never ignore", duration: "7 min", source: "Ghana Health Service", category: "Pregnancy" },
  { id: "preparing-labour", title: "Preparing for labour", duration: "10 min", source: "CHPS Network", category: "Labour" },
  { id: "breastfeeding", title: "Breastfeeding basics", duration: "8 min", source: "Ghana Health Service", category: "Postnatal" },
  { id: "first-weeks", title: "Your baby's first weeks", duration: "6 min", source: "CHPS Network", category: "Baby Care" },
];

export const CATEGORIES = ["All", "Pregnancy", "Nutrition", "Labour", "Postnatal", "Baby Care"] as const;
