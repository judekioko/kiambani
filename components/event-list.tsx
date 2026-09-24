import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type EventItem = {
  id: string;
  title: string;
  description?: string | null;
  audience: string;
  className?: string | null;
  authorName: string;
  startDate: Date;
  endDate?: Date | null;
};

export function EventList({ items }: { items: EventItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">No upcoming events</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardBody>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-medium text-slate-900">{item.title}</h3>
              <Badge tone="emerald">{item.className ?? item.audience}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {item.startDate.toLocaleDateString()}
              {item.endDate ? ` – ${item.endDate.toLocaleDateString()}` : ""}
            </p>
            {item.description ? (
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                {item.description}
              </p>
            ) : null}
            <p className="mt-3 text-xs text-slate-400">Posted by {item.authorName}</p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
