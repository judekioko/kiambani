"use client";

import { useActionState } from "react";
import { submitPaymentClaim } from "@/lib/actions/payment-claims";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

export function PaymentClaimForm({
  invoices,
}: {
  invoices: { id: string; label: string; balance: number }[];
}) {
  const [state, formAction, pending] = useActionState(submitPaymentClaim, {});

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div>
        <Label htmlFor="invoiceId">Paying for</Label>
        <Select id="invoiceId" name="invoiceId" required>
          {invoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="amount">Amount paid (KES)</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            min={1}
            step="1"
            defaultValue={invoices[0]?.balance}
            required
          />
        </div>
        <div>
          <Label htmlFor="depositDate">Date paid</Label>
          <Input
            id="depositDate"
            name="depositDate"
            type="date"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="bankReference">Bank slip / transaction reference</Label>
        <Input id="bankReference" name="bankReference" placeholder="e.g. the slip number" required />
      </div>
      <div>
        <Label htmlFor="note">Note (optional)</Label>
        <Input id="note" name="note" placeholder="Anything the finance office should know" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting..." : "Submit payment for confirmation"}
      </Button>
    </form>
  );
}
