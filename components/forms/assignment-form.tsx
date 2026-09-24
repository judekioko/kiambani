"use client";

import { useActionState } from "react";
import { assignClassSubjectTeacher } from "@/lib/actions/academic";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function AssignmentForm({
  classId,
  subjects,
  teachers,
  terms,
}: {
  classId: string;
  subjects: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
  terms: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(assignClassSubjectTeacher, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="classId" value={classId} />
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
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
        <Label htmlFor="subjectId">Subject</Label>
        <Select id="subjectId" name="subjectId" required>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="teacherId">Teacher</Label>
        <Select id="teacherId" name="teacherId" required>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Assign"}
      </Button>
    </form>
  );
}
