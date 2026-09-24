"use client";

import { useActionState } from "react";
import { generateInvoicesForClass } from "@/lib/actions/fees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

export function GenerateInvoicesForm({
  classes,
  terms,
}: {
  classes: { id: string; name: string }[];
  terms: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(generateInvoicesForClass, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div>
        <Label htmlFor="classId">Class</Label>
        <Select id="classId" name="classId" required>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="termId">Term</Label>
        <Select id="termId" name="termId" required>
          {terms.map((term) => (
            <option key={term.id} value={term.id}>
              {term.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="dueDate">Due date</Label>
        <Input id="dueDate" name="dueDate" type="date" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Generating..." : "Generate invoices for class"}
      </Button>
    </form>
  );
}
