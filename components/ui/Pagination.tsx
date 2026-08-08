"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

// Application Components → Pagination, "Pagination" component, pulled
// from the Figma design system ("gfgfg" in the Figma MCP), node
// 1115:68622 (Type=Page default/Page minimal/Card default/Card minimal/
// Card button group, Shape=Square/Circle). Only "Page default" (numbered
// pages + text Previous/Next, with ellipsis truncation for long ranges)
// is implemented — no other page in this app has an image carousel, so
// the dot-indicator/carousel-arrow variants on this same Figma page
// aren't relevant either. This app currently has no paginated list (the
// admin DataTable renders its full result set), so this fills a real gap
// for whenever one is added.
export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function getPageList(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set([1, 2, totalPages - 1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("ellipsis");
    result.push(p);
  });
  return result;
}

export default function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  const pages = getPageList(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={`flex w-full items-center justify-center gap-3 border-t border-gray-200 pt-5 ${className ?? ""}`}
    >
      <div className="flex flex-1 items-center">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex items-center gap-1 font-body text-sm font-semibold text-gray-600 disabled:opacity-40"
        >
          <ArrowLeftIcon className="size-5" />
          Previous
        </button>
      </div>
      <div className="flex items-start gap-0.5">
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`e-${i}`} className="flex size-10 items-center justify-center font-body text-sm text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`flex size-10 items-center justify-center rounded-md font-body text-sm font-medium ${
                p === page ? "bg-gray-50 text-gray-700" : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>
      <div className="flex flex-1 items-center justify-end">
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex items-center gap-1 font-body text-sm font-semibold text-gray-600 disabled:opacity-40"
        >
          Next
          <ArrowRightIcon className="size-5" />
        </button>
      </div>
    </nav>
  );
}
