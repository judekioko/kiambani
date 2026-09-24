"use client";

import { useActionState } from "react";
import { createAssessment } from "@/lib/actions/grading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

export function AssessmentForm({
  assignments,
}: {
  assignments: {
    id: string;
    classId: string;
    subjectId: string;
    termId: string;
    label: string;
  }[];
}) {
  const [state, formAction, pending] = useActionState(createAssessment, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div>
        <Label htmlFor="assignment">Class / Subject / Term</Label>
        <Select
          id="assignment"
          onChange={(e) => {
            const [classId, subjectId, termId] = e.target.value.split("|");
            const form = e.target.form!;
            (form.elements.namedItem("classId") as HTMLInputElement).value = classId;
            (form.elements.namedItem("subjectId") as HTMLInputElement).value = subjectId;
            (form.elements.namedItem("termId") as HTMLInputElement).value = termId;
          }}
          defaultValue=""
        >
          <option value="" disabled>
            Select an assignment
          </option>
          {assignments.map((a) => (
            <option key={a.id} value={`${a.classId}|${a.subjectId}|${a.termId}`}>
              {a.label}
            </option>
          ))}
        </Select>
      </div>
      <input type="hidden" name="classId" />
      <input type="hidden" name="subjectId" />
      <input type="hidden" name="termId" />
      <div>
        <Label htmlFor="name">Assessment name</Label>
        <Input id="name" name="name" placeholder="e.g. Mid-term CAT" required />
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Select id="type" name="type" required defaultValue="CAT">
          <option value="EXAM">Exam</option>
          <option value="CAT">CAT</option>
          <option value="ASSIGNMENT">Assignment</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="maxScore">Max score</Label>
        <Input id="maxScore" name="maxScore" type="number" step="0.5" min={1} required />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Create assessment"}
      </Button>
    </form>
  );
}
