// Shared by any chart that buckets rows into "last N calendar months",
// so the month-key format used to group rows always matches the labels
// used to render the x-axis.
export function lastNMonths(n: number, now: Date = new Date()): { key: string; label: string }[] {
  const months: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("en-GH", { month: "short" }) });
  }
  return months;
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`;
}
