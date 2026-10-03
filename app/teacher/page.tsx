import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EventList } from "@/components/event-list";

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

  const myClassIds = classes.map((c) => c.id);
  const events = await prisma.schoolEvent.findMany({
    where: {
      startDate: { gte: new Date() },
      OR: [{ audience: "ALL" }, { audience: "TEACHERS" }, { classId: { in: myClassIds } }],
    },
    include: { class: true, author: true },
    orderBy: { startDate: "asc" },
    take: 3,
  });

  return (
    <div>
      <PageHeader title="Dashboard" description={`Welcome back, ${session.name}.`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your course(s)</CardTitle>
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
              <p className="text-slate-400">You are not a course coordinator for any course.</p>
            ) : null}
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Units you teach</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center justify-between">
                <span>
                  {a.subject.name} · {a.class.name} · {a.term.name}
                </span>
                <Link href="/teacher/grades" className="text-emerald-700 hover:underline">
                  Results
                </Link>
              </div>
            ))}
            {assignments.length === 0 ? (
              <p className="text-slate-400">No unit assignments yet.</p>
            ) : null}
          </CardBody>
        </Card>
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
