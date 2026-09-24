"use client";

import { useActionState } from "react";
import { createGradeBand } from "@/lib/actions/grading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function GradeBandForm({ gradingScaleId }: { gradingScaleId: string }) {
  const [state, formAction, pending] = useActionState(createGradeBand, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="gradingScaleId" value={gradingScaleId} />
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="minPercent">Min %</Label>
          <Input id="minPercent" name="minPercent" type="number" step="0.1" min={0} max={100} required />
        </div>
        <div>
          <Label htmlFor="maxPercent">Max %</Label>
          <Input id="maxPercent" name="maxPercent" type="number" step="0.1" min={0} max={100} required />
        </div>
      </div>
      <div>
        <Label htmlFor="letter">Letter grade</Label>
        <Input id="letter" name="letter" placeholder="e.g. A" required />
      </div>
      <div>
        <Label htmlFor="comment">Comment</Label>
        <Input id="comment" name="comment" placeholder="e.g. Excellent" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Add band"}
      </Button>
    </form>
  );
}
