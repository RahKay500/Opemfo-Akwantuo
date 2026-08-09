"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import { formatDate } from "@/lib/utils";
import { calculateAge } from "@/lib/pregnancy";
import Avatar from "@/components/ui/Avatar";

export interface PatientRow {
  id: string;
  name: string;
  phone: string;
  dateOfBirth: string;
  edd: string | null;
  createdAt: string;
  facilityName?: string | null;
}

export default function PatientsClient({
  patients,
  showFacility = false,
}: {
  patients: PatientRow[];
  showFacility?: boolean;
}) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const filtered = useMemo(() => {
    if (!query) return patients;
    const q = query.toLowerCase();
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(query) ||
        (p.facilityName?.toLowerCase().includes(q) ?? false)
    );
  }, [patients, query]);

  const columns: DataTableColumn<PatientRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar
            name={r.name}
            size="sm"
            background="#DBEAFE"
            textColor="#2663EB"
            textClassName="text-xs font-bold"
          />
          <span className="font-medium text-[#1A1A2E]">{r.name}</span>
        </div>
      ),
    },
    { key: "phone", header: "Phone", render: (r) => r.phone },
    ...(showFacility
      ? [{ key: "facility", header: "Facility", render: (r: PatientRow) => r.facilityName ?? "—" } as DataTableColumn<PatientRow>]
      : []),
    { key: "age", header: "Age", render: (r) => calculateAge(new Date(r.dateOfBirth)) },
    { key: "edd", header: "Due Date", render: (r) => (r.edd ? formatDate(r.edd) : "—") },
    { key: "registered", header: "Registered", render: (r) => formatDate(r.createdAt) },
  ];

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={showFacility ? "Search patients by name, phone, or facility..." : "Search patients by name or phone..."}
          className="h-10 w-full rounded-md border border-[#E2E8F0] px-3 text-sm outline-none focus:border-[#E4A8F3] lg:flex-1"
        />
      </div>

      <p className="mb-3 text-sm font-semibold text-[#1A1A2E]">
        {filtered.length} {filtered.length === 1 ? "Patient" : "Patients"}
      </p>

      <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} emptyMessage="No patients match this search." />
    </>
  );
}
