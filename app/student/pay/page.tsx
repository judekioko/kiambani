import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getMyStudent } from "@/lib/my-student";
import { getStudentFinance } from "@/lib/finance";
import { formatDate, formatKes } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { PaymentClaimForm } from "@/components/forms/payment-claim-form";

const claimTone = { PENDING: "amber", CONFIRMED: "emerald", REJECTED: "rose" } as const;
const claimLabel = { PENDING: "Awaiting confirmation", CONFIRMED: "Confirmed", REJECTED: "Rejected" } as const;

export default async function PayFeesPage() {
  const session = await requireRole("STUDENT");
  const student = await getMyStudent(session.userId);

  if (!student) {
    return (
      <div>
        <PageHeader title="Pay Fees" />
        <p className="text-sm text-slate-500">
          Your account is not linked to a student record yet. Please contact the college office.
        </p>
      </div>
    );
  }

  const [finance, college, claims] = await Promise.all([
    getStudentFinance(student.id),
    prisma.school.findFirst(),
    prisma.paymentClaim.findMany({
      where: { studentId: student.id },
      include: { invoice: { include: { term: { include: { academicYear: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const owingInvoices = finance.invoices.filter((i) => i.balance > 0);
  const hasBank = Boolean(college?.bankName && college.bankAccountNumber);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pay Fees"
        description={`Current balance: ${formatKes(finance.balance)}`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>1. Pay at the bank</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            {hasBank ? (
              <dl className="space-y-2">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Bank</dt>
                  <dd className="font-medium text-slate-900">{college?.bankName}</dd>
                </div>
                {college?.bankBranch ? (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Branch</dt>
                    <dd className="font-medium text-slate-900">{college.bankBranch}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Account name</dt>
                  <dd className="font-medium text-slate-900">{college?.bankAccountName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Account number</dt>
                  <dd className="font-mono font-medium text-slate-900">
                    {college?.bankAccountNumber}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Reference</dt>
                  <dd className="font-mono font-medium text-slate-900">{student.admissionNo}</dd>
                </div>
              </dl>
            ) : (
              <Alert variant="info">
                The college bank details have not been added yet. Please ask the finance office for
                the account to deposit into.
              </Alert>
            )}
            <p className="text-xs text-slate-500">
              Use your admission number as the payment reference, and keep your bank slip.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Tell us you have paid</CardTitle>
          </CardHeader>
          <CardBody>
            {owingInvoices.length === 0 ? (
              <p className="text-sm text-emerald-700">
                You have no outstanding fees. Nothing to pay right now.
              </p>
            ) : (
              <PaymentClaimForm
                invoices={owingInvoices.map((i) => ({
                  id: i.id,
                  label: `${i.term.academicYear.name} ${i.term.name} - balance ${formatKes(i.balance)}`,
                  balance: i.balance,
                }))}
              />
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your submitted payments</CardTitle>
        </CardHeader>
        <CardBody>
          <Table>
            <Thead>
              <Tr>
                <Th>Submitted</Th>
                <Th>Semester</Th>
                <Th>Reference</Th>
                <Th className="text-right">Amount</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {claims.map((c) => (
                <Tr key={c.id}>
                  <Td className="whitespace-nowrap">{formatDate(c.createdAt)}</Td>
                  <Td>
                    {c.invoice.term.academicYear.name} {c.invoice.term.name}
                  </Td>
                  <Td className="font-mono">{c.bankReference}</Td>
                  <Td className="text-right">{c.amount.toLocaleString()}</Td>
                  <Td>
                    <Badge tone={claimTone[c.status]}>{claimLabel[c.status]}</Badge>
                    {c.status === "REJECTED" && c.rejectionReason ? (
                      <p className="mt-1 text-xs text-rose-600">{c.rejectionReason}</p>
                    ) : null}
                  </Td>
                </Tr>
              ))}
              {claims.length === 0 ? (
                <Tr>
                  <Td colSpan={5} className="text-center text-slate-400">
                    You have not submitted any payments yet
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
