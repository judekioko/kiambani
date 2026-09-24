"use client";

import { useActionState } from "react";
import { createStudent } from "@/lib/actions/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

export function StudentForm({ classes }: { classes: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createStudent, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" required />
        </div>
        <div>
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" required />
        </div>
      </div>
      <div>
        <Label htmlFor="admissionNo">Admission number</Label>
        <Input id="admissionNo" name="admissionNo" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="dob">Date of birth</Label>
          <Input id="dob" name="dob" type="date" required />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select id="gender" name="gender" required defaultValue="MALE">
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="classId">Class</Label>
        <Select id="classId" name="classId" defaultValue="">
          <option value="">Unassigned</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </Select>
      </div>
      <hr className="border-slate-200" />
      <p className="text-sm font-medium text-slate-700">Primary guardian</p>
      <div>
        <Label htmlFor="guardianName">Guardian name</Label>
        <Input id="guardianName" name="guardianName" required />
      </div>
      <div>
        <Label htmlFor="guardianEmail">Guardian email</Label>
        <Input id="guardianEmail" name="guardianEmail" type="email" required />
        <p className="mt-1 text-xs text-slate-400">
          If this email doesn&apos;t exist yet, a new parent login is created automatically.
        </p>
      </div>
      <div>
        <Label htmlFor="guardianPhone">Guardian phone</Label>
        <Input id="guardianPhone" name="guardianPhone" />
      </div>
      <div>
        <Label htmlFor="guardianRelationship">Relationship</Label>
        <Input
          id="guardianRelationship"
          name="guardianRelationship"
          placeholder="e.g. Mother, Father, Guardian"
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Create student"}
      </Button>
    </form>
  );
}
