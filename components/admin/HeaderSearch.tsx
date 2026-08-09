"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/ui/icons";

interface SearchResult {
  id: string;
  name: string;
  subtitle: string;
}

interface SearchResults {
  facilities: SearchResult[];
  staff: SearchResult[];
  patients: SearchResult[];
}

const EMPTY: SearchResults = { facilities: [], staff: [], patients: [] };

export default function HeaderSearch() {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(EMPTY);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) return;
      const { data } = await res.json();
      setResults(data);
      setOpen(true);
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  function goTo(section: "facilities" | "staff-directory" | "patients", name: string) {
    setOpen(false);
    setQuery("");
    router.push(`/admin/${section}?q=${encodeURIComponent(name)}`);
  }

  const hasResults = results.facilities.length + results.staff.length + results.patients.length > 0;

  return (
    <div ref={ref} className="relative hidden w-64 lg:block">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
        placeholder="Search facilities, staff, patients..."
        className="h-9 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] pl-9 pr-3 text-sm text-[#1A1A2E] outline-none placeholder:text-[#94A3B8] focus:border-[#9F1AB1] focus:bg-white"
      />

      {open && query.trim().length >= 2 && (
        <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-md border border-[#E2E8F0] bg-white py-1 shadow-lg">
          {!hasResults && <p className="px-3.5 py-2 text-sm text-[#6B7280]">No matches for &quot;{query}&quot;</p>}

          {results.facilities.length > 0 && (
            <ResultGroup label="Facilities">
              {results.facilities.map((f) => (
                <ResultRow key={f.id} result={f} onClick={() => goTo("facilities", f.name)} />
              ))}
            </ResultGroup>
          )}

          {results.staff.length > 0 && (
            <ResultGroup label="Staff">
              {results.staff.map((s) => (
                <ResultRow key={s.id} result={s} onClick={() => goTo("staff-directory", s.name)} />
              ))}
            </ResultGroup>
          )}

          {results.patients.length > 0 && (
            <ResultGroup label="Patients">
              {results.patients.map((p) => (
                <ResultRow key={p.id} result={p} onClick={() => goTo("patients", p.name)} />
              ))}
            </ResultGroup>
          )}
        </div>
      )}
    </div>
  );
}

function ResultGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-1">
      <p className="px-3.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">{label}</p>
      {children}
    </div>
  );
}

function ResultRow({ result, onClick }: { result: SearchResult; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-start px-3.5 py-2 text-left hover:bg-[#F8FAFC]"
    >
      <span className="text-sm font-medium text-[#1A1A2E]">{result.name}</span>
      <span className="text-xs text-[#6B7280]">{result.subtitle}</span>
    </button>
  );
}
