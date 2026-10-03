import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { AnnouncementList } from "@/components/announcement-list";

export default async function AccountantAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    where: { audience: { in: ["ALL", "TEACHERS"] } },
    include: { class: true, author: true },
    orderBy: { publishedAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <PageHeader title="Announcements" description="College-wide updates." />
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
