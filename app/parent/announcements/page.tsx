import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getGuardianStudents } from "@/lib/guardian";
import { PageHeader } from "@/components/page-header";
import { AnnouncementList } from "@/components/announcement-list";

export default async function ParentAnnouncementsPage() {
  const session = await requireRole("PARENT");
  const students = await getGuardianStudents(session.userId);
  const classIds = students.map((s) => s.classId).filter((id): id is string => Boolean(id));

  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [{ audience: "ALL" }, { audience: "PARENTS" }, { classId: { in: classIds } }],
    },
    include: { class: true, author: true },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <PageHeader title="Announcements" description="Updates from the school and your child's class." />
      <AnnouncementList
        items={announcements.map((a) => ({
          id: a.id,
          title: a.title,
          body: a.body,
          audience: a.audience,
          className: a.class?.name,
          authorName: a.author.name,
          publishedAt: a.publishedAt,
        }))}
      />
    </div>
  );
}
