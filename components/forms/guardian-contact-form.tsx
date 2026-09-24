"use client";

import { useActionState } from "react";
import { updateGuardianContact } from "@/lib/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function GuardianContactForm({
  studentId,
  guardianId,
  initialEmail,
  initialPhone,
}: {
  studentId: string;
  guardianId: string;
  initialEmail: string;
  initialPhone: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateGuardianContact, {});

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="guardianId" value={guardianId} />
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`email-${guardianId}`} className="text-xs">
            Email
          </Label>
          <Input
            id={`email-${guardianId}`}
            name="email"
            type="email"
            defaultValue={initialEmail}
            className="text-sm"
          />
        </div>
        <div>
          <Label htmlFor={`phone-${guardianId}`} className="text-xs">
            Phone
          </Label>
          <Input
            id={`phone-${guardianId}`}
            name="phone"
            type="tel"
            defaultValue={initialPhone ?? ""}
            placeholder="e.g. +254712345678"
            className="text-sm"
          />
        </div>
      </div>
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Saving..." : "Save contact details"}
      </Button>
    </form>
  );
}
