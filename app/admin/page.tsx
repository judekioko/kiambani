import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { AnnouncementList } from "@/components/announcement-list";
import { EventList } from "@/components/event-list";

export default async function AdminDashboardPage() {
  const [studentCount, staffCount, classCount, invoices, announcements, events] =
    await Promise.all([
      prisma.student.count({ where: { status: "ACTIVE" } }),
      prisma.user.count({ where: { role: { in: ["TEACHER", "ACCOUNTANT"] }, active: true } }),
      prisma.schoolClass.count(),
      prisma.invoice.findMany({ include: { payments: true } }),
      prisma.announcement.findMany({
        include: { class: true, author: true },
        orderBy: { publishedAt: "desc" },
        take: 5,
      }),
      prisma.schoolEvent.findMany({
        where: { startDate: { gte: new Date() } },
        include: { class: true, author: true },
        orderBy: { startDate: "asc" },
        take: 3,
      }),
    ]);

  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = invoices.reduce(
    (sum, i) => sum + i.payments.reduce((s, p) => s + p.amount, 0),
    0
  );

  return (
    <div>
      <PageHeader title="Dashboard" description="Masinga Technical Vocational College at a glance." />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active students" value={String(studentCount)} />
        <StatCard label="Staff" value={String(staffCount)} />
        <StatCard label="Courses" value={String(classCount)} />
        <StatCard
          label="Fees outstanding"
          value={(totalBilled - totalPaid).toLocaleString()}
          hint={`of ${totalBilled.toLocaleString()} billed`}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-base font-semibold text-slate-900">Recent announcements</h2>
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
        <div>
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
    </div>
  );
}
