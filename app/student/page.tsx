import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getMyStudents } from "@/lib/my-student";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EventList } from "@/components/event-list";

export default async function StudentDashboardPage() {
  const session = await requireRole("STUDENT");
  const students = await getMyStudents(session.userId);

  const balances = await Promise.all(
    students.map(async (student) => {
      const invoices = await prisma.invoice.findMany({
        where: { studentId: student.id },
        include: { payments: true },
      });
      const billed = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
      const paid = invoices.reduce(
        (sum, i) => sum + i.payments.reduce((s, p) => s + p.amount, 0),
        0
      );
      return billed - paid;
    })
  );

  const classIds = students.map((s) => s.classId).filter((id): id is string => Boolean(id));
  const events = await prisma.schoolEvent.findMany({
    where: {
      startDate: { gte: new Date() },
      OR: [{ audience: "ALL" }, { audience: "PARENTS" }, { classId: { in: classIds } }],
    },
    include: { class: true, author: true },
    orderBy: { startDate: "asc" },
    take: 3,
  });

  return (
    <div>
      <PageHeader title="Dashboard" description={`Welcome, ${session.name}.`} />
      <div className="grid gap-4 sm:grid-cols-2">
        {students.map((student, i) => (
          <Card key={student.id}>
            <CardHeader>
              <CardTitle>
                {student.firstName} {student.lastName}
              </CardTitle>
            </CardHeader>
            <CardBody className="space-y-2 text-sm">
              <p>
                <span className="text-slate-500">Admission No.:</span> {student.admissionNo}
              </p>
              <p>
                <span className="text-slate-500">Course:</span>{" "}
                {student.class?.name ?? "Unassigned"}
              </p>
              <p>
                <span className="text-slate-500">Fee balance:</span>{" "}
                {balances[i].toLocaleString()}
              </p>
              <div className="flex gap-3 pt-2 text-emerald-700">
                <Link href="/student/attendance" className="hover:underline">
                  Attendance
                </Link>
                <Link href="/student/grades" className="hover:underline">
                  Results
                </Link>
                <Link href="/student/fees" className="hover:underline">
                  Fees
                </Link>
              </div>
            </CardBody>
          </Card>
        ))}
        {students.length === 0 ? (
          <p className="text-sm text-slate-500">
            Your account is not linked to a student record yet. Please contact the college office.
          </p>
        ) : null}
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
