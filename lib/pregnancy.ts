const GESTATION_WEEKS = 40;
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const GESTATION_DAYS = GESTATION_WEEKS * 7;

export interface PregnancyProgress {
  week: number;
  trimester: "First" | "Second" | "Third";
  progressPercent: number;
  weeksToGo: number;
}

export function calculateAge(dateOfBirth: Date, asOf: Date = new Date()): number {
  let age = asOf.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = asOf.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && asOf.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

export function calculatePregnancyProgress(lmp: Date, asOf: Date = new Date()): PregnancyProgress {
  const rawWeek = Math.floor((asOf.getTime() - lmp.getTime()) / MS_PER_WEEK);
  const week = Math.min(Math.max(rawWeek, 0), GESTATION_WEEKS);
  const trimester = week < 14 ? "First" : week < 28 ? "Second" : "Third";
  const progressPercent = Math.round((week / GESTATION_WEEKS) * 100);
  const weeksToGo = Math.max(GESTATION_WEEKS - week, 0);
  return { week, trimester, progressPercent, weeksToGo };
}

export function calculateEdd(lmp: Date): Date {
  return new Date(lmp.getTime() + GESTATION_DAYS * MS_PER_DAY);
}

// LMP is unreliable for mothers with irregular cycles — when dated by an
// early ultrasound instead, this back-calculates the "effective LMP" a scan
// implies (scanDate minus gestational age at the scan), so calculateEdd and
// calculatePregnancyProgress keep working unchanged from that point on.
export function calculateEffectiveLmpFromScan(
  scanDate: Date,
  gestationalAgeWeeks: number,
  gestationalAgeDays = 0
): Date {
  const totalDays = gestationalAgeWeeks * 7 + gestationalAgeDays;
  return new Date(scanDate.getTime() - totalDays * MS_PER_DAY);
}

// Inverse of the above — reconstructs the weeks/days a scan originally
// reported from the stored scanDate + effective lmp, since only those two
// (not the original weeks/days split) are persisted. Used to pre-fill the
// edit-patient form for a patient dated by ultrasound.
export function gestationalAgeAtScan(scanDate: Date, effectiveLmp: Date): { weeks: number; days: number } {
  const totalDays = Math.round((scanDate.getTime() - effectiveLmp.getTime()) / MS_PER_DAY);
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7 };
}

// Standard ANC cadence: monthly through the first two trimesters, then every
// 2 weeks once the mother reaches the third trimester (week >= 28, matching
// this file's own trimester boundary above).
export function suggestNextVisitDate(currentWeek: number, from: Date = new Date()): Date {
  const intervalDays = currentWeek >= 28 ? 14 : 28;
  return new Date(from.getTime() + intervalDays * MS_PER_DAY);
}
