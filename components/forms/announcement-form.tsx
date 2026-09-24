"use client";

import { useActionState, useState } from "react";
import { createAnnouncement } from "@/lib/actions/announcements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

export function AnnouncementForm({
  classes,
  restrictToClass = false,
}: {
  classes: { id: string; name: string }[];
  restrictToClass?: boolean;
}) {
  const [state, formAction, pending] = useActionState(createAnnouncement, {});
  const [audience, setAudience] = useState(restrictToClass ? "CLASS" : "ALL");

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="body">Message</Label>
        <textarea
          id="body"
          name="body"
          required
          rows={4}
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-600 focus:outline-2 focus:outline-emerald-100"
        />
      </div>
      {restrictToClass ? (
        <input type="hidden" name="audience" value="CLASS" />
      ) : (
        <div>
          <Label htmlFor="audience">Audience</Label>
          <Select
            id="audience"
            name="audience"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          >
            <option value="ALL">Everyone</option>
            <option value="TEACHERS">Teachers</option>
            <option value="PARENTS">Parents</option>
            <option value="CLASS">A specific class</option>
          </Select>
        </div>
      )}
      {audience === "CLASS" ? (
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
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Posting..." : "Post announcement"}
      </Button>
    </form>
  );
}
