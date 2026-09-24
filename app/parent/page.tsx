import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getGuardianStudents } from "@/lib/guardian";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ParentDashboardPage() {
  const session = await requireRole("PARENT");
  const students = await getGuardianStudents(session.userId);

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
                <span className="text-slate-500">Class:</span>{" "}
                {student.class?.name ?? "Unassigned"}
              </p>
              <p>
                <span className="text-slate-500">Fee balance:</span>{" "}
                {balances[i].toLocaleString()}
              </p>
              <div className="flex gap-3 pt-2 text-emerald-700">
                <Link href="/parent/attendance" className="hover:underline">
                  Attendance
                </Link>
                <Link href="/parent/grades" className="hover:underline">
                  Grades
                </Link>
                <Link href="/parent/fees" className="hover:underline">
                  Fees
                </Link>
              </div>
            </CardBody>
          </Card>
        ))}
        {students.length === 0 ? (
          <p className="text-sm text-slate-500">No children linked to your account yet.</p>
        ) : null}
      </div>
    </div>
  );
}
