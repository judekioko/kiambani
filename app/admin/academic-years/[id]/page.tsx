import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TermForm } from "@/components/forms/term-form";

export default async function AcademicYearDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const year = await prisma.academicYear.findUnique({
    where: { id },
    include: { terms: { orderBy: { startDate: "asc" } } },
  });

  if (!year) notFound();

  return (
    <div>
      <PageHeader
        title={`Academic Year: ${year.name}`}
        description={`${year.startDate.toLocaleDateString()} – ${year.endDate.toLocaleDateString()}`}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <Thead>
              <Tr>
                <Th>Term</Th>
                <Th>Start</Th>
                <Th>End</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {year.terms.map((term) => (
                <Tr key={term.id}>
                  <Td className="font-medium text-slate-900">{term.name}</Td>
                  <Td>{term.startDate.toLocaleDateString()}</Td>
                  <Td>{term.endDate.toLocaleDateString()}</Td>
                  <Td>{term.isCurrent ? <Badge tone="emerald">Current</Badge> : null}</Td>
                </Tr>
              ))}
              {year.terms.length === 0 ? (
                <Tr>
                  <Td colSpan={4} className="text-center text-slate-400">
                    No terms yet
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          </Table>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>New term</CardTitle>
          </CardHeader>
          <CardBody>
            <TermForm academicYearId={year.id} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
