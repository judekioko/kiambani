import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export default async function TeacherDashboardPage() {
  const session = await requireRole("TEACHER");

  const [classes, assignments] = await Promise.all([
    prisma.schoolClass.findMany({
      where: { classTeacherId: session.userId },
      include: { _count: { select: { students: true } } },
    }),
    prisma.classSubjectTeacher.findMany({
      where: { teacherId: session.userId },
      include: { class: true, subject: true, term: true },
    }),
  ]);

  return (
    <div>
      <PageHeader title="Dashboard" description={`Welcome back, ${session.name}.`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your class(es)</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            {classes.map((cls) => (
              <div key={cls.id} className="flex items-center justify-between">
                <span>{cls.name}</span>
                <Link href="/teacher/attendance" className="text-emerald-700 hover:underline">
                  Mark attendance ({cls._count.students} students)
                </Link>
              </div>
            ))}
            {classes.length === 0 ? (
              <p className="text-slate-400">You are not a class teacher for any class.</p>
            ) : null}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subjects you teach</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between">
                <span>
                  {a.subject.name} · {a.class.name} · {a.term.name}
                </span>
                <Link href="/teacher/grades" className="text-emerald-700 hover:underline">
                  Grades
                </Link>
              </div>
            ))}
            {assignments.length === 0 ? (
              <p className="text-slate-400">No subject assignments yet.</p>
            ) : null}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
