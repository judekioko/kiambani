"use client";

import { useActionState } from "react";
import { createStaff } from "@/lib/actions/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

export function StaffForm() {
  const [state, formAction, pending] = useActionState(createStaff, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div>
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select id="role" name="role" required defaultValue="TEACHER">
          <option value="TEACHER">Trainer</option>
          <option value="ACCOUNTANT">Accountant</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="staffNo">Staff number</Label>
        <Input id="staffNo" name="staffNo" required />
      </div>
      <div>
        <Label htmlFor="position">Position</Label>
        <Input id="position" name="position" placeholder="e.g. Head of Department" required />
      </div>
      <div>
        <Label htmlFor="department">Department</Label>
        <Input id="department" name="department" placeholder="e.g. Engineering" />
      </div>
      <div>
        <Label htmlFor="hireDate">Hire date</Label>
        <Input id="hireDate" name="hireDate" type="date" required />
      </div>
      <div>
        <Label htmlFor="password">Temporary password</Label>
        <Input id="password" name="password" type="password" required minLength={6} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Create staff member"}
      </Button>
    </form>
  );
}
