import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EventForm } from "@/components/forms/event-form";
import { EventList } from "@/components/event-list";

export default async function TeacherEventsPage() {
  const session = await requireRole("TEACHER");

  const myClasses = await prisma.schoolClass.findMany({
    where: { classTeacherId: session.userId },
    orderBy: { name: "asc" },
  });

  const events = await prisma.schoolEvent.findMany({
    where: {
      OR: [
        { audience: "ALL" },
        { audience: "TEACHERS" },
        { classId: { in: myClasses.map((c) => c.id) } },
      ],
    },
    include: { class: true, author: true },
    orderBy: { startDate: "asc" },
    take: 50,
  });

  return (
    <div>
      <PageHeader title="Events & Activities" description="School-wide and your class activities." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
        <Card>
          <CardHeader>
            <CardTitle>New class event</CardTitle>
          </CardHeader>
          <CardBody>
            {myClasses.length === 0 ? (
              <p className="text-sm text-slate-500">
                You are not a class teacher for any class yet.
              </p>
            ) : (
              <EventForm classes={myClasses} restrictToClass />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
