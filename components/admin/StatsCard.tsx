export default function StatsCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
      <p className="text-sm text-[#6B7280]">{label}</p>
      <p className="mt-1.5 text-3xl font-semibold text-[#1A1A2E]">{value}</p>
    </div>
  );
}
