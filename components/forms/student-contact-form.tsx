"use client";

import { useActionState } from "react";
import { createStudentLogin, updateStudentContact } from "@/lib/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function StudentContactForm({
  studentId,
  hasLogin,
  initialEmail,
  initialPhone,
}: {
  studentId: string;
  hasLogin: boolean;
  initialEmail: string;
  initialPhone: string;
}) {
  const [state, formAction, pending] = useActionState(
    hasLogin ? updateStudentContact : createStudentLogin,
    {}
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="studentId" value={studentId} />
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      {!hasLogin ? (
        <p className="text-xs text-slate-500">
          This student has no portal login yet. Enter their email and phone to create one.
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="student-email" className="text-xs">
            Email
          </Label>
          <Input
            id="student-email"
            name="email"
            type="email"
            defaultValue={initialEmail}
            required
            className="text-sm"
          />
        </div>
        <div>
          <Label htmlFor="student-phone" className="text-xs">
            Phone
          </Label>
          <Input
            id="student-phone"
            name="phone"
            type="tel"
            defaultValue={initialPhone}
            placeholder="e.g. +254712345678"
            required
            className="text-sm"
          />
        </div>
      </div>
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Saving..." : hasLogin ? "Save contact details" : "Create login"}
      </Button>
    </form>
  );
}
