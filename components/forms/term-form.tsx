"use client";

import { useActionState } from "react";
import { createTerm } from "@/lib/actions/academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function TermForm({ academicYearId }: { academicYearId: string }) {
  const [state, formAction, pending] = useActionState(createTerm, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="academicYearId" value={academicYearId} />
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="e.g. Term 1" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="startDate">Start date</Label>
          <Input id="startDate" name="startDate" type="date" required />
        </div>
        <div>
          <Label htmlFor="endDate">End date</Label>
          <Input id="endDate" name="endDate" type="date" required />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" name="isCurrent" className="rounded border-slate-300" />
        Set as current term
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Create term"}
      </Button>
    </form>
  );
}
