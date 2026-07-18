"use client";

import { useMemo, useState } from "react";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import { formatDate, initials } from "@/lib/utils";
import { calculateAge } from "@/lib/pregnancy";

export interface PatientRow {
  id: string;
  name: string;
  phone: string;
  dateOfBirth: string;
  edd: string | null;
  createdAt: string;
}

export default function PatientsClient({ patients }: { patients: PatientRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return patients;
    const q = query.toLowerCase();
    return patients.filter((p) => p.name.toLowerCase().includes(q) || p.phone.includes(query));
  }, [patients, query]);

  const columns: DataTableColumn<PatientRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DBEAFE] text-xs font-bold text-[#2663EB]">
            {initials(r.name)}
          </span>
          <span className="font-medium text-[#1A1A2E]">{r.name}</span>
        </div>
      ),
    },
    { key: "phone", header: "Phone", render: (r) => r.phone },
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
          placeholder="Search patients by name or phone..."
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
