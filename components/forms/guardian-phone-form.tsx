"use client";

import { useActionState } from "react";
import { updateGuardianPhone } from "@/lib/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function GuardianPhoneForm({
  studentId,
  guardianId,
  initialPhone,
}: {
  studentId: string;
  guardianId: string;
  initialPhone: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateGuardianPhone, {});

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="guardianId" value={guardianId} />
      <Input
        name="phone"
        type="tel"
        defaultValue={initialPhone ?? ""}
        placeholder="e.g. +254712345678"
        className="w-40"
      />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
      {state?.error ? <span className="text-xs text-rose-600">{state.error}</span> : null}
      {state?.success ? <span className="text-xs text-emerald-600">Saved</span> : null}
    </form>
  );
}
