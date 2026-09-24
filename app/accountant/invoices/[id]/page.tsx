import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaymentForm } from "@/components/forms/payment-form";

const statusTone = {
  UNPAID: "rose",
  PARTIAL: "amber",
  PAID: "emerald",
} as const;

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      student: { include: { class: true } },
      term: true,
      items: true,
      payments: { orderBy: { paidAt: "desc" }, include: { recordedBy: true } },
    },
  });
  if (!invoice) notFound();

  const paid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = invoice.totalAmount - paid;

  return (
    <div>
      <PageHeader
        title={`Invoice: ${invoice.student.firstName} ${invoice.student.lastName}`}
        description={`${invoice.student.class?.name ?? "Unassigned"} · ${invoice.term.name}`}
        action={<Badge tone={statusTone[invoice.status]}>{invoice.status}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardBody>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Item</Th>
                    <Th>Amount</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {invoice.items.map((item) => (
                    <Tr key={item.id}>
                      <Td>{item.name}</Td>
                      <Td>{item.amount.toLocaleString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <span className="text-slate-500">Total:</span>{" "}
                  <span className="font-medium">{invoice.totalAmount.toLocaleString()}</span>
                </p>
                <p>
                  <span className="text-slate-500">Paid:</span> {paid.toLocaleString()}
                </p>
                <p>
                  <span className="text-slate-500">Balance:</span>{" "}
                  <span className="font-medium">{balance.toLocaleString()}</span>
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment history</CardTitle>
            </CardHeader>
            <CardBody>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Amount</Th>
                    <Th>Method</Th>
                    <Th>Reference</Th>
                    <Th>Recorded by</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {invoice.payments.map((p) => (
                    <Tr key={p.id}>
                      <Td>{p.paidAt.toLocaleDateString()}</Td>
                      <Td>{p.amount.toLocaleString()}</Td>
                      <Td>{p.method}</Td>
                      <Td>{p.reference}</Td>
                      <Td>{p.recordedBy.name}</Td>
                    </Tr>
                  ))}
                  {invoice.payments.length === 0 ? (
                    <Tr>
                      <Td colSpan={5} className="text-center text-slate-400">
                        No payments yet
                      </Td>
                    </Tr>
                  ) : null}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Record payment</CardTitle>
          </CardHeader>
          <CardBody>
            {balance <= 0 ? (
              <p className="text-sm text-emerald-700">This invoice is fully paid.</p>
            ) : (
              <PaymentForm invoiceId={invoice.id} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
