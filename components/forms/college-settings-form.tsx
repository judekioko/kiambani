"use client";

import { useActionState } from "react";
import { updateCollegeSettings } from "@/lib/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

type Settings = {
  address: string | null;
  phone: string | null;
  email: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankBranch: string | null;
};

export function CollegeSettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState(updateCollegeSettings, {});

  return (
    <form action={formAction} className="space-y-6">
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-slate-900">Bank account for fee payments</legend>
        <p className="text-xs text-slate-500">
          Students see these details on the Pay Fees page. Enter the college&apos;s real account.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="bankName">Bank</Label>
            <Input id="bankName" name="bankName" defaultValue={settings.bankName ?? ""} />
          </div>
          <div>
            <Label htmlFor="bankBranch">Branch</Label>
            <Input id="bankBranch" name="bankBranch" defaultValue={settings.bankBranch ?? ""} />
          </div>
          <div>
            <Label htmlFor="bankAccountName">Account name</Label>
            <Input
              id="bankAccountName"
              name="bankAccountName"
              defaultValue={settings.bankAccountName ?? ""}
            />
          </div>
          <div>
            <Label htmlFor="bankAccountNumber">Account number</Label>
            <Input
              id="bankAccountNumber"
              name="bankAccountNumber"
              defaultValue={settings.bankAccountNumber ?? ""}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-slate-900">College contact</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="tel" defaultValue={settings.phone ?? ""} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" defaultValue={settings.email ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={settings.address ?? ""} />
          </div>
        </div>
      </fieldset>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
