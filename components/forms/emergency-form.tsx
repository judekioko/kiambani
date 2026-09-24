"use client";

import { useActionState } from "react";
import { sendEmergencyBroadcast } from "@/lib/actions/emergency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function EmergencyForm() {
  const [state, formAction, pending] = useActionState(sendEmergencyBroadcast, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="e.g. Early closure today" required />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-rose-600 focus:outline-2 focus:outline-rose-100"
        />
      </div>
      <p className="text-xs text-slate-500">
        This posts an announcement to everyone and texts every guardian with a phone number on
        file.
      </p>
      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Sending..." : "Send emergency broadcast"}
      </Button>
    </form>
  );
}
