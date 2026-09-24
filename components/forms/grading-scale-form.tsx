"use client";

import { useActionState } from "react";
import { createGradingScale } from "@/lib/actions/grading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function GradingScaleForm() {
  const [state, formAction, pending] = useActionState(createGradingScale, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div>
        <Label htmlFor="name">Scale name</Label>
        <Input id="name" name="name" placeholder="e.g. Standard KCPE Scale" required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Create scale"}
      </Button>
    </form>
  );
}
