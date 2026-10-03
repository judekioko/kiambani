import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { confirmPaymentClaim, rejectPaymentClaim } from "@/lib/actions/payment-claims";
import { formatDate, formatKes } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const include = {
  student: { include: { class: true } },
  invoice: { include: { term: { include: { academicYear: true } }, payments: true } },
} as const;

export default async function PaymentConfirmationsPage() {
  await requireRole("ACCOUNTANT", "ADMIN");

  const [pending, reviewed] = await Promise.all([
    prisma.paymentClaim.findMany({
      where: { status: "PENDING" },
      include,
      orderBy: { createdAt: "asc" },
    }),
    prisma.paymentClaim.findMany({
      where: { status: { in: ["CONFIRMED", "REJECTED"] } },
      include,
      orderBy: { reviewedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Confirmations"
        description="Bank deposits students say they have made. Check each against the bank statement, then confirm or reject."
      />

      <Card>
        <CardHeader>
          <CardTitle>Awaiting confirmation ({pending.length})</CardTitle>
        </CardHeader>
        <CardBody>
          <Table>
            <Thead>
              <Tr>
                <Th>Student</Th>
                <Th>Semester</Th>
                <Th>Bank reference</Th>
                <Th>Paid on</Th>
                <Th className="text-right">Amount</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pending.map((c) => {
                const paid = c.invoice.payments.reduce((s, p) => s + p.amount, 0);
                return (
                  <Tr key={c.id}>
                    <Td>
                      <p className="font-medium text-slate-900">
                        {c.student.firstName} {c.student.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {c.student.admissionNo} · {c.student.class?.name ?? "-"}
                      </p>
                    </Td>
                    <Td>
                      {c.invoice.term.academicYear.name} {c.invoice.term.name}
                      <p className="text-xs text-slate-500">
                        Balance {formatKes(c.invoice.totalAmount - paid)}
                      </p>
                    </Td>
                    <Td className="font-mono">
                      {c.bankReference}
                      {c.note ? <p className="font-sans text-xs text-slate-500">{c.note}</p> : null}
                    </Td>
                    <Td className="whitespace-nowrap">{formatDate(c.depositDate)}</Td>
                    <Td className="text-right font-medium text-slate-900">
                      {c.amount.toLocaleString()}
                    </Td>
                    <Td>
                      <div className="flex flex-col gap-2">
                        <form action={confirmPaymentClaim}>
                          <input type="hidden" name="claimId" value={c.id} />
                          <Button type="submit" size="sm">
                            Confirm
                          </Button>
                        </form>
                        <form action={rejectPaymentClaim} className="flex gap-1">
                          <input type="hidden" name="claimId" value={c.id} />
                          <Input name="reason" placeholder="Reason" className="w-32 py-1 text-xs" />
                          <Button type="submit" size="sm" variant="danger">
                            Reject
                          </Button>
                        </form>
                      </div>
                    </Td>
                  </Tr>
                );
              })}
              {pending.length === 0 ? (
                <Tr>
                  <Td colSpan={6} className="text-center text-slate-400">
                    Nothing waiting for confirmation
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recently reviewed</CardTitle>
        </CardHeader>
        <CardBody>
          <Table>
            <Thead>
              <Tr>
                <Th>Student</Th>
                <Th>Bank reference</Th>
                <Th className="text-right">Amount</Th>
                <Th>Result</Th>
              </Tr>
            </Thead>
            <Tbody>
              {reviewed.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    {c.student.firstName} {c.student.lastName}
                  </Td>
                  <Td className="font-mono">{c.bankReference}</Td>
                  <Td className="text-right">{c.amount.toLocaleString()}</Td>
                  <Td>
                    <Badge tone={c.status === "CONFIRMED" ? "emerald" : "rose"}>
                      {c.status === "CONFIRMED" ? "Confirmed" : "Rejected"}
                    </Badge>
                  </Td>
                </Tr>
              ))}
              {reviewed.length === 0 ? (
                <Tr>
                  <Td colSpan={4} className="text-center text-slate-400">
                    No reviewed payments yet
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
}
