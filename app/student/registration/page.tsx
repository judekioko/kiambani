import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getCurrentTerm, getMyStudent } from "@/lib/my-student";
import { getStudentFinance } from "@/lib/finance";
import { formatKes } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { UnitRegistrationForm } from "@/components/forms/unit-registration-form";
import { DropUnitButton } from "@/components/forms/drop-unit-button";

export default async function UnitRegistrationPage() {
  const session = await requireRole("STUDENT");
  const student = await getMyStudent(session.userId);
  const term = await getCurrentTerm();

  if (!student || !term) {
    return (
      <div>
        <PageHeader title="Unit Registration" />
        <p className="text-sm text-slate-500">
          {student ? "There is no current semester open for registration." : "Your account is not linked to a student record yet."}
        </p>
      </div>
    );
  }

  const [finance, offered, registered] = await Promise.all([
    getStudentFinance(student.id),
    student.classId
      ? prisma.classSubjectTeacher.findMany({
          where: { classId: student.classId, termId: term.id },
          include: { subject: true, teacher: true },
          orderBy: { subject: { code: "asc" } },
        })
      : Promise.resolve([]),
    prisma.unitRegistration.findMany({
      where: { studentId: student.id, termId: term.id },
      include: { subject: true },
      orderBy: { subject: { code: "asc" } },
    }),
  ]);

  const registeredIds = new Set(registered.map((r) => r.subjectId));
  const available = offered.filter((o) => !registeredIds.has(o.subjectId));

  return (
    <div>
      <PageHeader
        title="Unit Registration"
        description={`${term.name} ${term.academicYear.name} · ${student.class?.name ?? "No course assigned"}`}
        action={
          registered.length > 0 && finance.cleared ? (
            <Link
              href="/student/exam-card"
              className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Print exam card
            </Link>
          ) : null
        }
      />

      <div className="space-y-6">
        {!finance.currentInvoice ? (
          <Alert variant="info">
            Fees for this semester have not been billed yet. Please contact the finance office.
          </Alert>
        ) : !finance.cleared ? (
          <Alert variant="error">
            You have an outstanding fee balance of <b>{formatKes(finance.balance)}</b>. Clear it to
            register for units and print your exam card.{" "}
            <Link href="/student/pay" className="font-semibold underline">
              Pay fees
            </Link>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Registered units</CardTitle>
          </CardHeader>
          <CardBody>
            <Table>
              <Thead>
                <Tr>
                  <Th>Unit Code</Th>
                  <Th>Unit Name</Th>
                  <Th>Status</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {registered.map((r) => (
                  <Tr key={r.id}>
                    <Td>{r.subject.code}</Td>
                    <Td className="font-medium text-slate-900">{r.subject.name}</Td>
                    <Td>
                      <Badge tone={r.status === "APPROVED" ? "emerald" : "amber"}>
                        {r.status === "APPROVED" ? "Approved" : "Pending"}
                      </Badge>
                    </Td>
                    <Td>
                      <DropUnitButton registrationId={r.id} />
                    </Td>
                  </Tr>
                ))}
                {registered.length === 0 ? (
                  <Tr>
                    <Td colSpan={4} className="text-center text-slate-400">
                      No units registered yet
                    </Td>
                  </Tr>
                ) : null}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {finance.cleared ? (
          <Card>
            <CardHeader>
              <CardTitle>Units available to register</CardTitle>
            </CardHeader>
            <CardBody>
              {available.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {offered.length === 0
                    ? "No units have been set up for your course this semester yet."
                    : "You have registered all the units offered for your course this semester."}
                </p>
              ) : (
                <UnitRegistrationForm
                  units={available.map((o) => ({
                    id: o.subjectId,
                    code: o.subject.code,
                    name: o.subject.name,
                    trainer: o.teacher.name,
                  }))}
                />
              )}
            </CardBody>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
