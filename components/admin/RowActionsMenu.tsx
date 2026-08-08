"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

export default function RowActionsMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Row actions"
        className="flex h-8 w-8 items-center justify-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1A1A2E]"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
          <path d="M10 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM10 11.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM10 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
        </svg>
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="absolute right-0 top-full z-10 mt-1 w-40 rounded-md border border-[#E2E8F0] bg-white py-1 shadow-lg"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function RowActionItem({
  children,
  onClick,
  href,
  tone = "default",
}: {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: "default" | "danger";
}) {
  const className = `block w-full px-3.5 py-2 text-left text-sm font-medium ${
    tone === "danger" ? "text-[#DC2626]" : "text-[#1A1A2E]"
  } hover:bg-[#F8FAFC]`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}
