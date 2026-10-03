"use client";

import { useActionState } from "react";
import { createFeeStructure } from "@/lib/actions/fees";
import { feeItemNames } from "@/lib/validators/fees";
import { feeLabel } from "@/lib/fee-labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

export function FeeStructureForm({
  classes,
  terms,
}: {
  classes: { id: string; name: string }[];
  terms: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createFeeStructure, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div>
        <Label htmlFor="classId">Course</Label>
        <Select id="classId" name="classId" required>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="termId">Semester</Label>
        <Select id="termId" name="termId" required>
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Fee items (leave blank to skip)</Label>
        {feeItemNames.map((name) => (
          <div key={name} className="flex items-center gap-2">
            <span className="w-44 text-sm text-slate-600">{feeLabel(name)}</span>
            <Input
              type="number"
              min={0}
              step="1"
              name={`amount_${name}`}
              placeholder="0"
              className="w-32"
            />
          </div>
        ))}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Create fee structure"}
      </Button>
    </form>
  );
}
