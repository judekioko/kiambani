import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";

export default async function AccountantDashboardPage() {
  const [invoices, recentPayments] = await Promise.all([
    prisma.invoice.findMany({ include: { payments: true } }),
    prisma.payment.findMany({
      include: { invoice: { include: { student: true } } },
      orderBy: { paidAt: "desc" },
      take: 10,
    }),
  ]);

  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = invoices.reduce(
    (sum, i) => sum + i.payments.reduce((s, p) => s + p.amount, 0),
    0
  );
  const unpaidCount = invoices.filter((i) => i.status !== "PAID").length;

  return (
    <div>
      <PageHeader title="Dashboard" description="Fee collection overview." />
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total billed" value={totalBilled.toLocaleString()} />
        <StatCard label="Total collected" value={totalPaid.toLocaleString()} />
        <StatCard label="Outstanding invoices" value={String(unpaidCount)} />
      </div>
      <h2 className="mb-3 text-base font-semibold text-slate-900">Recent payments</h2>
      <Table>
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Student</Th>
            <Th>Amount</Th>
            <Th>Method</Th>
          </Tr>
        </Thead>
        <Tbody>
          {recentPayments.map((p) => (
            <Tr key={p.id}>
              <Td>{p.paidAt.toLocaleDateString()}</Td>
              <Td>
                {p.invoice.student.firstName} {p.invoice.student.lastName}
              </Td>
              <Td>{p.amount.toLocaleString()}</Td>
              <Td>{p.method}</Td>
            </Tr>
          ))}
          {recentPayments.length === 0 ? (
            <Tr>
              <Td colSpan={4} className="text-center text-slate-400">
                No payments yet
              </Td>
            </Tr>
          ) : null}
        </Tbody>
      </Table>
    </div>
  );
}
