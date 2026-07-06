type Status = "Active" | "Pending" | "Inactive";

const STYLES: Record<Status, string> = {
  Active: "bg-[#F0FDF4] text-[#16A34A]",
  Pending: "bg-[#FFF7ED] text-[#EA580C]",
  Inactive: "bg-[#FEF2F2] text-[#DC2626]",
};

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}>
      {status}
    </span>
  );
}
