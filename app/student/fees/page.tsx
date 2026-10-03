import Link from "next/link";
import { requireRole } from "@/lib/session";
import { getMyStudent } from "@/lib/my-student";
import { getStudentFinance } from "@/lib/finance";
import { formatDate, formatKes } from "@/lib/format";
import { COLLEGE_NAME } from "@/lib/brand";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { PrintButton } from "@/components/print-button";

export default async function FeeStatementPage() {
  const session = await requireRole("STUDENT");
  const student = await getMyStudent(session.userId);

  if (!student) {
    return (
      <div>
        <PageHeader title="Fee Statement" />
        <p className="text-sm text-slate-500">
          Your account is not linked to a student record yet. Please contact the college office.
        </p>
      </div>
    );
  }

  const finance = await getStudentFinance(student.id);
  const owing = finance.balance > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Statement"
        description="Every invoice and payment across all semesters."
        action={
          <div className="flex gap-2 print:hidden">
            <PrintButton label="Print statement" />
            <Link
              href="/student/pay"
              className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Pay fees
            </Link>
          </div>
        }
      />

      <Card className="print:border-slate-400 print:shadow-none">
        <CardBody className="space-y-5">
          <div className="hidden text-center print:block">
            <h1 className="text-lg font-semibold uppercase">{COLLEGE_NAME}</h1>
            <p className="text-sm uppercase tracking-wide text-slate-500">Student fee statement</p>
          </div>

          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">Student</dt>
              <dd className="font-medium text-slate-900">
                {student.firstName} {student.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Admission No.</dt>
              <dd className="font-medium text-slate-900">{student.admissionNo}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Course</dt>
              <dd className="font-medium text-slate-900">{student.class?.name ?? "-"}</dd>
            </div>
          </dl>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Total billed</p>
              <p className="text-lg font-semibold text-slate-900">{formatKes(finance.totalBilled)}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Total paid</p>
              <p className="text-lg font-semibold text-slate-900">{formatKes(finance.totalPaid)}</p>
            </div>
            <div className={`rounded-lg p-4 ${owing ? "bg-rose-50" : "bg-emerald-50"}`}>
              <p className="text-xs text-slate-500">Balance</p>
              <p
                className={`text-lg font-semibold ${owing ? "text-rose-600" : "text-emerald-700"}`}
              >
                {formatKes(finance.balance)}
              </p>
            </div>
          </div>

          <Table>
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th className="text-right">Debit</Th>
                <Th className="text-right">Credit</Th>
                <Th className="text-right">Balance</Th>
                <Th className="print:hidden"></Th>
              </Tr>
            </Thead>
            <Tbody>
              {finance.statement.map((row, i) => (
                <Tr key={i}>
                  <Td className="whitespace-nowrap">{formatDate(row.date)}</Td>
                  <Td>{row.description}</Td>
                  <Td className="text-right">{row.debit ? row.debit.toLocaleString() : ""}</Td>
                  <Td className="text-right text-emerald-700">
                    {row.credit ? row.credit.toLocaleString() : ""}
                  </Td>
                  <Td className="text-right font-medium text-slate-900">
                    {row.balance.toLocaleString()}
                  </Td>
                  <Td className="print:hidden">
                    {row.receiptId ? (
                      <Link
                        href={`/student/receipts/${row.receiptId}`}
                        className="text-emerald-700 hover:underline"
                      >
                        Receipt
                      </Link>
                    ) : null}
                  </Td>
                </Tr>
              ))}
              {finance.statement.length === 0 ? (
                <Tr>
                  <Td colSpan={6} className="text-center text-slate-400">
                    No invoices or payments yet
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          </Table>
          <p className="text-xs text-slate-400">
            Statement generated on {formatDate(new Date())}. A negative balance means you are in
            credit.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
