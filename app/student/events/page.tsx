import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getMyStudents } from "@/lib/my-student";
import { PageHeader } from "@/components/page-header";
import { EventList } from "@/components/event-list";

export default async function StudentEventsPage() {
  const session = await requireRole("STUDENT");
  const students = await getMyStudents(session.userId);
  const classIds = students.map((s) => s.classId).filter((id): id is string => Boolean(id));

  const events = await prisma.schoolEvent.findMany({
    where: {
      OR: [{ audience: "ALL" }, { audience: "PARENTS" }, { classId: { in: classIds } }],
    },
    include: { class: true, author: true },
    orderBy: { startDate: "asc" },
    take: 50,
  });

  return (
    <div>
      <PageHeader
        title="Events & Activities"
        description="Upcoming activities from the college and your course."
      />
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
  );
}
