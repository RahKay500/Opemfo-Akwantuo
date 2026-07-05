const GESTATION_WEEKS = 40;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export interface PregnancyProgress {
  week: number;
  trimester: "First" | "Second" | "Third";
  progressPercent: number;
  weeksToGo: number;
}

export function calculatePregnancyProgress(lmp: Date, asOf: Date = new Date()): PregnancyProgress {
  const rawWeek = Math.floor((asOf.getTime() - lmp.getTime()) / MS_PER_WEEK);
  const week = Math.min(Math.max(rawWeek, 0), GESTATION_WEEKS);
  const trimester = week < 14 ? "First" : week < 28 ? "Second" : "Third";
  const progressPercent = Math.round((week / GESTATION_WEEKS) * 100);
  const weeksToGo = Math.max(GESTATION_WEEKS - week, 0);
  return { week, trimester, progressPercent, weeksToGo };
}
