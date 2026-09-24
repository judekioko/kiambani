import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EventForm } from "@/components/forms/event-form";
import { EventList } from "@/components/event-list";

export default async function AdminEventsPage() {
  const [events, classes] = await Promise.all([
    prisma.schoolEvent.findMany({
      include: { class: true, author: true },
      orderBy: { startDate: "asc" },
      take: 50,
    }),
    prisma.schoolClass.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Events & Activities"
        description="Trips, exams, sports days and other upcoming activities."
      />
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
            <CardTitle>New event</CardTitle>
          </CardHeader>
          <CardBody>
            <EventForm classes={classes} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
