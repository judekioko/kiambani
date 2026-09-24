import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { AnnouncementList } from "@/components/announcement-list";

export default async function AdminDashboardPage() {
  const [studentCount, staffCount, classCount, invoices, announcements] = await Promise.all([
    prisma.student.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: { in: ["TEACHER", "ACCOUNTANT"] }, active: true } }),
    prisma.schoolClass.count(),
    prisma.invoice.findMany({ include: { payments: true } }),
    prisma.announcement.findMany({
      include: { class: true, author: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
  ]);

  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = invoices.reduce(
    (sum, i) => sum + i.payments.reduce((s, p) => s + p.amount, 0),
    0
  );

  return (
    <div>
      <PageHeader title="Dashboard" description="Kiambani School at a glance." />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active students" value={String(studentCount)} />
        <StatCard label="Staff" value={String(staffCount)} />
        <StatCard label="Classes" value={String(classCount)} />
        <StatCard
          label="Fees outstanding"
          value={(totalBilled - totalPaid).toLocaleString()}
          hint={`of ${totalBilled.toLocaleString()} billed`}
        />
      </div>
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
  );
}
