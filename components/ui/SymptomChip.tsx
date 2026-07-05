import { cn } from "@/lib/utils";

interface SymptomChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export default function SymptomChip({ label, selected, onClick }: SymptomChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-badge border-[1.5px] px-4 py-2.5 font-body text-[13px] font-medium transition-colors",
        selected
          ? "border-primary bg-lilac-light text-lilac-deeper"
          : "border-border-color bg-white text-text-secondary"
      )}
    >
      {label}
    </button>
  );
}
