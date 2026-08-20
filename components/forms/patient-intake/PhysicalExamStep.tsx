"use client";

import Field from "./Field";
import ExamRow from "./ExamRow";
import { PHYSICAL_EXAM_AREAS, type PhysicalExamState } from "@/lib/mch-record";

export default function PhysicalExamStep({
  value,
  onChange,
}: {
  value: PhysicalExamState;
  onChange: (value: PhysicalExamState) => void;
}) {
  return (
    <Field label="Physical Examination at First Visit" className="lg:col-span-2">
      <div className="rounded-input border-[1.5px] border-border-color bg-white px-4">
        {PHYSICAL_EXAM_AREAS.map((area) => (
          <ExamRow
            key={area.key}
            label={area.label}
            value={value[area.key]}
            onChange={(v) => onChange({ ...value, [area.key]: v })}
          />
        ))}
      </div>
    </Field>
  );
}
