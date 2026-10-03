import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getCurrentTerm, getMyStudent, sessionProgress } from "@/lib/my-student";
import { getStudentFinance } from "@/lib/finance";
import { formatKes } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EventList } from "@/components/event-list";

export default async function StudentDashboardPage() {
  const session = await requireRole("STUDENT");
  const student = await getMyStudent(session.userId);
  const firstName = session.name.split(" ")[0];

  if (!student) {
    return (
      <div>
        <PageHeader title={`Welcome back, ${firstName}`} />
        <p className="text-sm text-slate-500">
          Your account is not linked to a student record yet. Please contact the college office.
        </p>
      </div>
    );
  }

  const term = await getCurrentTerm();
  const [finance, registrations, events] = await Promise.all([
    getStudentFinance(student.id),
    term
      ? prisma.unitRegistration.findMany({
          where: { studentId: student.id, termId: term.id },
          include: { subject: true },
          orderBy: { subject: { code: "asc" } },
        })
      : Promise.resolve([]),
    prisma.schoolEvent.findMany({
      where: {
        startDate: { gte: new Date() },
        OR: [
          { audience: "ALL" },
          { audience: "PARENTS" },
          ...(student.classId ? [{ classId: student.classId }] : []),
        ],
      },
      include: { class: true, author: true },
      orderBy: { startDate: "asc" },
      take: 3,
    }),
  ]);

  const progress = term ? sessionProgress(term.startDate, term.endDate) : 0;
  const owing = finance.balance > 0;

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="We're delighted to have you. Everything for your studies and fees is here."
        action={
          <div className="flex gap-2">
            <Link
              href="/student/fees"
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View statement
            </Link>
            <Link
              href="/student/pay"
              className="rounded-md bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-800"
            >
              Pay fees
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Current Registered Units</CardTitle>
            <Link
              href="/student/registration"
              className="text-sm font-medium text-emerald-700 hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardBody>
            <Table>
              <Thead>
                <Tr>
                  <Th>Unit Name</Th>
                  <Th>Unit Code</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <Tbody>
                {registrations.map((r) => (
                  <Tr key={r.id}>
                    <Td className="font-medium text-slate-900">{r.subject.name}</Td>
                    <Td>{r.subject.code}</Td>
                    <Td>
                      <Badge tone={r.status === "APPROVED" ? "emerald" : "amber"}>
                        {r.status === "APPROVED" ? "Approved" : "Pending"}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
                {registrations.length === 0 ? (
                  <Tr>
                    <Td colSpan={3} className="text-center text-slate-400">
                      You have not registered any units this semester.{" "}
                      <Link href="/student/registration" className="text-emerald-700 hover:underline">
                        Register now
                      </Link>
                    </Td>
                  </Tr>
                ) : null}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardBody>
              <p className="text-sm text-slate-500">Fee Balance</p>
              <p
                className={`mt-1 text-3xl font-semibold ${owing ? "text-rose-600" : "text-emerald-700"}`}
              >
                {formatKes(finance.balance)}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {owing
                  ? "Clear your balance to register units and print your exam card."
                  : finance.balance < 0
                    ? "You are in credit. Your fees are cleared."
                    : "Your fees are cleared."}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="space-y-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-900">
                  {term ? `${term.name} ${term.academicYear.name}` : "No current semester"}
                </p>
                <p className="mt-1 text-xs font-medium uppercase text-slate-500">
                  {student.class?.name ?? "No course assigned"}
                </p>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Current Session Progress</span>
                  <span className="font-semibold text-slate-700">{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-600"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <p className="text-sm text-slate-500">Hostel info</p>
              <p className="mt-1 text-base font-semibold uppercase text-slate-900">
                {student.hostelName
                  ? `${student.hostelName}${student.hostelRoom ? ` : ${student.hostelRoom}` : ""}`
                  : "No hostel allocated"}
              </p>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-base font-semibold text-slate-900">Upcoming events</h2>
        <EventList
          items={events.map((e) => ({
            id: e.id,
            title: e.title,
            description: e.description,
            audience: e.audience,
            className: e.class?.name,
            authorName: e.author.name,
            startDate: e.startDate,
            endDate: e.endDate,
          }))}
        />
      </div>
    </div>
  );
}
