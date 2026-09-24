import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementForm } from "@/components/forms/announcement-form";
import { AnnouncementList } from "@/components/announcement-list";

export default async function TeacherAnnouncementsPage() {
  const session = await requireRole("TEACHER");

  const myClasses = await prisma.schoolClass.findMany({
    where: { classTeacherId: session.userId },
    orderBy: { name: "asc" },
  });

  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [
        { audience: "ALL" },
        { audience: "TEACHERS" },
        { classId: { in: myClasses.map((c) => c.id) } },
      ],
    },
    include: { class: true, author: true },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <PageHeader title="Announcements" description="School-wide updates and your class notices." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
        <Card>
          <CardHeader>
            <CardTitle>New class announcement</CardTitle>
          </CardHeader>
          <CardBody>
            {myClasses.length === 0 ? (
              <p className="text-sm text-slate-500">
                You are not a class teacher for any class yet.
              </p>
            ) : (
              <AnnouncementForm classes={myClasses} restrictToClass />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
