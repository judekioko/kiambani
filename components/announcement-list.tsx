import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  audience: string;
  className?: string | null;
  authorName: string;
  publishedAt: Date;
};

export function AnnouncementList({ items }: { items: AnnouncementItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-400">No announcements yet</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id}>
          <CardBody>
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-medium text-slate-900">{item.title}</h3>
              <Badge tone="slate">{item.className ?? item.audience}</Badge>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{item.body}</p>
            <p className="mt-3 text-xs text-slate-400">
              {item.authorName} · {item.publishedAt.toLocaleDateString()}
            </p>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
