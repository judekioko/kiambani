"use client";

import { useActionState } from "react";
import { recordPayment } from "@/lib/actions/fees";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

export function PaymentForm({ invoiceId }: { invoiceId: string }) {
  const [state, formAction, pending] = useActionState(recordPayment, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="invoiceId" value={invoiceId} />
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" name="amount" type="number" step="1" min={1} required />
      </div>
      <div>
        <Label htmlFor="method">Method</Label>
        <Select id="method" name="method" required defaultValue="MPESA">
          <option value="CASH">Cash</option>
          <option value="MPESA">M-Pesa</option>
          <option value="BANK">Bank transfer</option>
          <option value="CHEQUE">Cheque</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="reference">Reference</Label>
        <Input id="reference" name="reference" placeholder="e.g. M-Pesa code" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Record payment"}
      </Button>
    </form>
  );
}
