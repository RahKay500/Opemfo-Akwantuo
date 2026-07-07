"use client";

import { useState, type ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  pageSize?: number;
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No records found.",
  onRowClick,
  pageSize = 20,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="overflow-hidden rounded-lg border border-[#E2E8F0] bg-white">
      <table className="hidden w-full text-left text-sm lg:table">
        <thead>
          <tr className="border-b border-[#E2E8F0] text-xs font-medium uppercase tracking-wide text-[#6B7280]">
            {columns.map((col) => (
              <th key={col.key} className="px-5 py-3">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pageRows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-[#6B7280]">
                {emptyMessage}
              </td>
            </tr>
          )}
          {pageRows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-[#E2E8F0] last:border-0 ${
                onRowClick ? "cursor-pointer hover:bg-[#F8FAFC]" : ""
              }`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-3.5 text-[#1A1A2E]">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divide-y divide-[#E2E8F0] lg:hidden">
        {pageRows.length === 0 && (
          <div className="px-5 py-8 text-center text-[#6B7280]">{emptyMessage}</div>
        )}
        {pageRows.map((row) => (
          <div
            key={rowKey(row)}
            onClick={() => onRowClick?.(row)}
            className={`flex flex-col gap-2 px-4 py-3.5 ${onRowClick ? "cursor-pointer active:bg-[#F8FAFC]" : ""}`}
          >
            {columns.map((col) => (
              <div key={col.key} className="flex items-start justify-between gap-3">
                <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                  {col.header}
                </span>
                <span className="text-right text-sm text-[#1A1A2E]">{col.render(row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#E2E8F0] px-5 py-3">
          <p className="text-xs text-[#6B7280]">
            Page {page} of {totalPages} · {rows.length} total
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#1A1A2E] disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md border border-[#E2E8F0] px-3 py-1.5 text-xs font-medium text-[#1A1A2E] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
