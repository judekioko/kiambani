"use client";

import { useActionState } from "react";
import { createSubject } from "@/lib/actions/academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function SubjectForm() {
  const [state, formAction, pending] = useActionState(createSubject, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div>
        <Label htmlFor="name">Subject name</Label>
        <Input id="name" name="name" placeholder="e.g. Mathematics" required />
      </div>
      <div>
        <Label htmlFor="code">Code</Label>
        <Input id="code" name="code" placeholder="e.g. MATH" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Create subject"}
      </Button>
    </form>
  );
}
