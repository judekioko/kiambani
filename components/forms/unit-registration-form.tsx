"use client";

import { useActionState } from "react";
import { registerUnits } from "@/lib/actions/registration";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function UnitRegistrationForm({
  units,
}: {
  units: { id: string; code: string; name: string; trainer: string }[];
}) {
  const [state, formAction, pending] = useActionState(registerUnits, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {units.map((unit) => (
          <li key={unit.id}>
            <label className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-slate-50">
              <input
                type="checkbox"
                name="subjectId"
                value={unit.id}
                defaultChecked
                className="h-4 w-4 rounded border-slate-300"
              />
              <span className="w-20 text-sm font-medium text-slate-500">{unit.code}</span>
              <span className="flex-1 text-sm font-medium text-slate-900">{unit.name}</span>
              <span className="text-xs text-slate-400">{unit.trainer}</span>
            </label>
          </li>
        ))}
      </ul>
      <Button type="submit" disabled={pending}>
        {pending ? "Registering..." : "Register selected units"}
      </Button>
    </form>
  );
}
