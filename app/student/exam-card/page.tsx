import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getCurrentTerm, getMyStudent } from "@/lib/my-student";
import { getStudentFinance } from "@/lib/finance";
import { formatDate, formatKes } from "@/lib/format";
import { COLLEGE_NAME } from "@/lib/brand";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { PrintButton } from "@/components/print-button";

export default async function ExamCardPage() {
  const session = await requireRole("STUDENT");
  const student = await getMyStudent(session.userId);
  const term = await getCurrentTerm();

  if (!student || !term) {
    return (
      <div>
        <PageHeader title="Exam Card" />
        <p className="text-sm text-slate-500">
          {student ? "There is no current semester." : "Your account is not linked to a student record yet."}
        </p>
      </div>
    );
  }

  const [finance, registered] = await Promise.all([
    getStudentFinance(student.id),
    prisma.unitRegistration.findMany({
      where: { studentId: student.id, termId: term.id },
      include: { subject: true },
      orderBy: { subject: { code: "asc" } },
    }),
  ]);

  const blocker = !finance.cleared
    ? finance.currentInvoice
      ? (
          <>
            You have an outstanding fee balance of <b>{formatKes(finance.balance)}</b>. Clear it to
            print your exam card.{" "}
            <Link href="/student/pay" className="font-semibold underline">
              Pay fees
            </Link>
          </>
        )
      : "Fees for this semester have not been billed yet. Please contact the finance office."
    : registered.length === 0
      ? (
          <>
            You have not registered any units yet.{" "}
            <Link href="/student/registration" className="font-semibold underline">
              Register units
            </Link>{" "}
            to get your exam card.
          </>
        )
      : null;

  if (blocker) {
    return (
      <div>
        <PageHeader title="Exam Card" description="Available once your fees are cleared and units registered." />
        <Alert variant="error">{blocker}</Alert>
      </div>
    );
  }

  const cardNo = `EC-${student.admissionNo.replace(/[^A-Za-z0-9]/g, "")}-${term.name.replace(/\s+/g, "")}`;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex justify-end print:hidden">
        <PrintButton label="Print exam card" />
      </div>
      <Card className="print:border-slate-400 print:shadow-none">
        <CardBody className="space-y-5">
          <div className="text-center">
            <h1 className="text-lg font-semibold uppercase text-slate-900">{COLLEGE_NAME}</h1>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Examination Card · {term.name} {term.academicYear.name}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 border-y border-slate-200 py-4 text-sm">
            <div>
              <dt className="text-slate-500">Student name</dt>
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
            <div>
              <dt className="text-slate-500">Exam card No.</dt>
              <dd className="font-mono font-medium text-slate-900">{cardNo}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Fees status</dt>
              <dd className="font-medium text-emerald-700">Cleared</dd>
            </div>
            <div>
              <dt className="text-slate-500">Issued</dt>
              <dd className="font-medium text-slate-900">{formatDate(new Date())}</dd>
            </div>
          </dl>

          <Table>
            <Thead>
              <Tr>
                <Th>#</Th>
                <Th>Unit Code</Th>
                <Th>Unit Name</Th>
                <Th>Invigilator signature</Th>
              </Tr>
            </Thead>
            <Tbody>
              {registered.map((r, i) => (
                <Tr key={r.id}>
                  <Td>{i + 1}</Td>
                  <Td>{r.subject.code}</Td>
                  <Td className="font-medium text-slate-900">{r.subject.name}</Td>
                  <Td></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <div className="grid grid-cols-2 gap-8 pt-6 text-xs text-slate-500">
            <div className="border-t border-slate-400 pt-2">Student signature</div>
            <div className="border-t border-slate-400 pt-2">Examinations officer / stamp</div>
          </div>
          <p className="text-center text-xs text-slate-400">
            This card must be presented at every examination. Not valid without the examinations
            officer&apos;s stamp.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
