// Shared by any screen that reports "how long between X and Y" across a set
// of referrals (e.g. sentAt→acknowledgedAt), so the minute/hour formatting
// stays consistent everywhere it's shown.
export function averageDurationLabel(pairs: { start: Date; end: Date | null }[]): string | null {
  const durations = pairs.filter((p) => p.end).map((p) => p.end!.getTime() - p.start.getTime());
  if (durations.length === 0) return null;

  const avgMinutes = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 60000);
  if (avgMinutes < 60) return `${avgMinutes} min`;
  const hours = Math.floor(avgMinutes / 60);
  const minutes = avgMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}
