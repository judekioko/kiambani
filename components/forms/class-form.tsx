"use client";

import { useActionState } from "react";
import { createSchoolClass } from "@/lib/actions/academic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

export function ClassForm({
  academicYears,
  teachers,
}: {
  academicYears: { id: string; name: string }[];
  teachers: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createSchoolClass, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div>
        <Label htmlFor="name">Class name</Label>
        <Input id="name" name="name" placeholder="e.g. Grade 4 Blue" required />
      </div>
      <div>
        <Label htmlFor="academicYearId">Academic year</Label>
        <Select id="academicYearId" name="academicYearId" required>
          {academicYears.map((year) => (
            <option key={year.id} value={year.id}>
              {year.name}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="classTeacherId">Class teacher</Label>
        <Select id="classTeacherId" name="classTeacherId" defaultValue="">
          <option value="">Unassigned</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Create class"}
      </Button>
    </form>
  );
}
