import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";

export default async function PaymentsPage() {
  const payments = await prisma.payment.findMany({
    include: { invoice: { include: { student: true } }, recordedBy: true },
    orderBy: { paidAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <PageHeader title="Payments" description="Recent payments across all students." />
      <Table>
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Student</Th>
            <Th>Amount</Th>
            <Th>Method</Th>
            <Th>Reference</Th>
            <Th>Recorded by</Th>
          </Tr>
        </Thead>
        <Tbody>
          {payments.map((p) => (
            <Tr key={p.id}>
              <Td>{p.paidAt.toLocaleDateString()}</Td>
              <Td>
                <Link
                  href={`/accountant/invoices/${p.invoiceId}`}
                  className="font-medium text-emerald-700 hover:underline"
                >
                  {p.invoice.student.firstName} {p.invoice.student.lastName}
                </Link>
              </Td>
              <Td>{p.amount.toLocaleString()}</Td>
              <Td>{p.method}</Td>
              <Td>{p.reference}</Td>
              <Td>{p.recordedBy.name}</Td>
            </Tr>
          ))}
          {payments.length === 0 ? (
            <Tr>
              <Td colSpan={6} className="text-center text-slate-400">
                No payments recorded yet
              </Td>
            </Tr>
          ) : null}
        </Tbody>
      </Table>
    </div>
  );
}
