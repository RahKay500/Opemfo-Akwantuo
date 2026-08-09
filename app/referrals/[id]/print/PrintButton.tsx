"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="h-10 rounded-input bg-primary px-5 font-body text-sm font-bold text-white"
    >
      Print / Save as PDF
    </button>
  );
}
