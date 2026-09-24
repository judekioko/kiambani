import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GenerateInvoicesForm } from "@/components/forms/generate-invoices-form";

const statusTone = {
  UNPAID: "rose",
  PARTIAL: "amber",
  PAID: "emerald",
} as const;

export default async function InvoicesPage() {
  const [invoices, classes, terms] = await Promise.all([
    prisma.invoice.findMany({
      include: { student: true, term: true, payments: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.schoolClass.findMany({ orderBy: { name: "asc" } }),
    prisma.term.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Invoices" description="Generate and review student invoices." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <Thead>
              <Tr>
                <Th>Student</Th>
                <Th>Term</Th>
                <Th>Total</Th>
                <Th>Paid</Th>
                <Th>Status</Th>
                <Th>Due</Th>
              </Tr>
            </Thead>
            <Tbody>
              {invoices.map((inv) => {
                const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
                return (
                  <Tr key={inv.id}>
                    <Td>
                      <Link
                        href={`/accountant/invoices/${inv.id}`}
                        className="font-medium text-emerald-700 hover:underline"
                      >
                        {inv.student.firstName} {inv.student.lastName}
                      </Link>
                    </Td>
                    <Td>{inv.term.name}</Td>
                    <Td>{inv.totalAmount.toLocaleString()}</Td>
                    <Td>{paid.toLocaleString()}</Td>
                    <Td>
                      <Badge tone={statusTone[inv.status]}>{inv.status}</Badge>
                    </Td>
                    <Td>{inv.dueDate.toLocaleDateString()}</Td>
                  </Tr>
                );
              })}
              {invoices.length === 0 ? (
                <Tr>
                  <Td colSpan={6} className="text-center text-slate-400">
                    No invoices yet
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          </Table>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Generate invoices</CardTitle>
          </CardHeader>
          <CardBody>
            {classes.length === 0 || terms.length === 0 ? (
              <p className="text-sm text-slate-500">No classes or terms yet.</p>
            ) : (
              <GenerateInvoicesForm classes={classes} terms={terms} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
