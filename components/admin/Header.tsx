import type { ReactNode } from "react";

export default function Header({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-4 py-5 lg:px-8">
      <h1 className="text-xl font-semibold text-[#1A1A2E]">{title}</h1>
      {action}
    </div>
  );
}
