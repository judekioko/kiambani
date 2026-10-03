import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getMyStudents } from "@/lib/my-student";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusTone = {
  UNPAID: "rose",
  PARTIAL: "amber",
  PAID: "emerald",
} as const;

export default async function StudentFeesPage() {
  const session = await requireRole("STUDENT");
  const students = await getMyStudents(session.userId);

  const invoicesByStudent = await Promise.all(
    students.map((student) =>
      prisma.invoice.findMany({
        where: { studentId: student.id },
        include: { term: true, payments: { include: { receipt: true } } },
        orderBy: { createdAt: "desc" },
      })
    )
  );

  return (
    <div>
      <PageHeader title="Fees" description="Your fee invoices, balances and receipts." />
      <div className="space-y-6">
        {students.map((student, i) => (
          <Card key={student.id}>
            <CardHeader>
              <CardTitle>
                {student.firstName} {student.lastName} · {student.class?.name ?? "Unassigned"}
              </CardTitle>
            </CardHeader>
            <CardBody>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Semester</Th>
                    <Th>Total</Th>
                    <Th>Paid</Th>
                    <Th>Balance</Th>
                    <Th>Status</Th>
                    <Th>Receipts</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {invoicesByStudent[i].map((inv) => {
                    const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
                    return (
                      <Tr key={inv.id}>
                        <Td>{inv.term.name}</Td>
                        <Td>{inv.totalAmount.toLocaleString()}</Td>
                        <Td>{paid.toLocaleString()}</Td>
                        <Td>{(inv.totalAmount - paid).toLocaleString()}</Td>
                        <Td>
                          <Badge tone={statusTone[inv.status]}>{inv.status}</Badge>
                        </Td>
                        <Td>
                          <div className="flex gap-2">
                            {inv.payments
                              .filter((p) => p.receipt)
                              .map((p) => (
                                <Link
                                  key={p.id}
                                  href={`/student/receipts/${p.receipt!.id}`}
                                  className="text-emerald-700 hover:underline"
                                >
                                  {p.paidAt.toLocaleDateString()}
                                </Link>
                              ))}
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
                  {invoicesByStudent[i].length === 0 ? (
                    <Tr>
                      <Td colSpan={6} className="text-center text-slate-400">
                        No invoices yet
                      </Td>
                    </Tr>
                  ) : null}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        ))}
        {students.length === 0 ? (
          <p className="text-sm text-slate-500">Your account is not linked to a student record yet. Please contact the college office.</p>
        ) : null}
      </div>
    </div>
  );
}
