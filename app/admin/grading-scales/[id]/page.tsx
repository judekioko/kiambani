import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { GradeBandForm } from "@/components/forms/grade-band-form";

export default async function GradingScaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scale = await prisma.gradingScale.findUnique({
    where: { id },
    include: { bands: { orderBy: { minPercent: "desc" } } },
  });
  if (!scale) notFound();

  return (
    <div>
      <PageHeader title={scale.name} description="Bands are matched by percentage range." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <Thead>
              <Tr>
                <Th>Range</Th>
                <Th>Letter</Th>
                <Th>Comment</Th>
              </Tr>
            </Thead>
            <Tbody>
              {scale.bands.map((band) => (
                <Tr key={band.id}>
                  <Td>
                    {band.minPercent}% – {band.maxPercent}%
                  </Td>
                  <Td className="font-medium text-slate-900">{band.letter}</Td>
                  <Td>{band.comment}</Td>
                </Tr>
              ))}
              {scale.bands.length === 0 ? (
                <Tr>
                  <Td colSpan={3} className="text-center text-slate-400">
                    No bands yet
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          </Table>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Add band</CardTitle>
          </CardHeader>
          <CardBody>
            <GradeBandForm gradingScaleId={scale.id} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
