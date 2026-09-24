import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { GradingScaleForm } from "@/components/forms/grading-scale-form";

export default async function GradingScalesPage() {
  const scales = await prisma.gradingScale.findMany({
    include: { _count: { select: { bands: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Grading Scales"
        description="Define letter-grade bands used to compute report cards."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Bands</Th>
              </Tr>
            </Thead>
            <Tbody>
              {scales.map((scale) => (
                <Tr key={scale.id}>
                  <Td>
                    <Link
                      href={`/admin/grading-scales/${scale.id}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      {scale.name}
                    </Link>
                  </Td>
                  <Td>{scale._count.bands}</Td>
                </Tr>
              ))}
              {scales.length === 0 ? (
                <Tr>
                  <Td colSpan={2} className="text-center text-slate-400">
                    No grading scales yet
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          </Table>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>New grading scale</CardTitle>
          </CardHeader>
          <CardBody>
            <GradingScaleForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
