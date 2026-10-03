import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AcademicYearForm } from "@/components/forms/academic-year-form";

export default async function AcademicYearsPage() {
  const years = await prisma.academicYear.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { terms: true, classes: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Academic Years & Semesters"
        description="Manage the college calendar, academic years and semesters."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Start</Th>
                <Th>End</Th>
                <Th>Semesters</Th>
                <Th>Courses</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {years.map((year) => (
                <Tr key={year.id}>
                  <Td>
                    <Link
                      href={`/admin/academic-years/${year.id}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      {year.name}
                    </Link>
                  </Td>
                  <Td>{year.startDate.toLocaleDateString()}</Td>
                  <Td>{year.endDate.toLocaleDateString()}</Td>
                  <Td>{year._count.terms}</Td>
                  <Td>{year._count.classes}</Td>
                  <Td>
                    {year.isCurrent ? <Badge tone="emerald">Current</Badge> : null}
                  </Td>
                </Tr>
              ))}
              {years.length === 0 ? (
                <Tr>
                  <Td colSpan={6} className="text-center text-slate-400">
                    No academic years yet
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          </Table>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>New academic year</CardTitle>
          </CardHeader>
          <CardBody>
            <AcademicYearForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
