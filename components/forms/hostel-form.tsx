"use client";

import { useActionState } from "react";
import { updateStudentHostel } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function HostelForm({
  studentId,
  hostelName,
  hostelRoom,
}: {
  studentId: string;
  hostelName: string | null;
  hostelRoom: string | null;
}) {
  const [state, formAction, pending] = useActionState(updateStudentHostel, {});

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="studentId" value={studentId} />
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="hostelName" className="text-xs">
            Hostel
          </Label>
          <Input
            id="hostelName"
            name="hostelName"
            defaultValue={hostelName ?? ""}
            placeholder="e.g. Ndolo Hostel"
            className="text-sm"
          />
        </div>
        <div>
          <Label htmlFor="hostelRoom" className="text-xs">
            Room
          </Label>
          <Input
            id="hostelRoom"
            name="hostelRoom"
            defaultValue={hostelRoom ?? ""}
            placeholder="e.g. 204"
            className="text-sm"
          />
        </div>
      </div>
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        {pending ? "Saving..." : "Save hostel"}
      </Button>
    </form>
  );
}
