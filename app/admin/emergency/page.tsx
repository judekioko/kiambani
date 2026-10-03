import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmergencyForm } from "@/components/forms/emergency-form";

export default async function EmergencyPage() {
  const broadcasts = await prisma.emergencyBroadcast.findMany({
    include: { sentBy: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div>
      <PageHeader
        title="Emergency Broadcast"
        description="Notify every student immediately, in-app and by SMS."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Message</Th>
                <Th>SMS</Th>
                <Th>Sent by</Th>
              </Tr>
            </Thead>
            <Tbody>
              {broadcasts.map((b) => (
                <Tr key={b.id}>
                  <Td>{b.createdAt.toLocaleString()}</Td>
                  <Td className="max-w-xs truncate">{b.message}</Td>
                  <Td>
                    {b.smsConfigured ? (
                      <Badge tone="emerald">{b.sentCount} sent</Badge>
                    ) : (
                      <Badge tone="amber">not configured</Badge>
                    )}
                  </Td>
                  <Td>{b.sentBy.name}</Td>
                </Tr>
              ))}
              {broadcasts.length === 0 ? (
                <Tr>
                  <Td colSpan={4} className="text-center text-slate-400">
                    No emergency broadcasts sent yet
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          </Table>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Send broadcast</CardTitle>
          </CardHeader>
          <CardBody>
            <EmergencyForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
