import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementForm } from "@/components/forms/announcement-form";
import { AnnouncementList } from "@/components/announcement-list";

export default async function AdminAnnouncementsPage() {
  const [announcements, classes] = await Promise.all([
    prisma.announcement.findMany({
      include: { class: true, author: true },
      orderBy: { publishedAt: "desc" },
      take: 50,
    }),
    prisma.schoolClass.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Announcements" description="Post updates to the whole college or a group." />
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
            <CardTitle>New announcement</CardTitle>
          </CardHeader>
          <CardBody>
            <AnnouncementForm classes={classes} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
