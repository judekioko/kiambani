"use client";

import { useTransition } from "react";
import { updateStudentStatus } from "@/lib/actions/students";
import { Select } from "@/components/ui/select";

const statuses = ["ACTIVE", "TRANSFERRED", "GRADUATED", "INACTIVE"] as const;

export function StudentStatusForm({
  studentId,
  status,
}: {
  studentId: string;
  status: (typeof statuses)[number];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">Change status</label>
      <Select
        defaultValue={status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as (typeof statuses)[number];
          startTransition(() => updateStudentStatus(studentId, next));
        }}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
    </div>
  );
}
