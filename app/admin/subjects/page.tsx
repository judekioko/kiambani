import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { SubjectForm } from "@/components/forms/subject-form";

export default async function SubjectsPage() {
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Subjects" description="The subjects taught across the school." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Code</Th>
              </Tr>
            </Thead>
            <Tbody>
              {subjects.map((subject) => (
                <Tr key={subject.id}>
                  <Td className="font-medium text-slate-900">{subject.name}</Td>
                  <Td>{subject.code}</Td>
                </Tr>
              ))}
              {subjects.length === 0 ? (
                <Tr>
                  <Td colSpan={2} className="text-center text-slate-400">
                    No subjects yet
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          </Table>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>New subject</CardTitle>
          </CardHeader>
          <CardBody>
            <SubjectForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
