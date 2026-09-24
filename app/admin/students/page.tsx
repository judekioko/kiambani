import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StudentForm } from "@/components/forms/student-form";

const statusTone = {
  ACTIVE: "emerald",
  TRANSFERRED: "amber",
  GRADUATED: "slate",
  INACTIVE: "rose",
} as const;

export default async function StudentsPage() {
  const [students, classes] = await Promise.all([
    prisma.student.findMany({
      include: { class: true },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.schoolClass.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Students" description="All enrolled students." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <Thead>
              <Tr>
                <Th>Admission No.</Th>
                <Th>Name</Th>
                <Th>Class</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {students.map((student) => (
                <Tr key={student.id}>
                  <Td>{student.admissionNo}</Td>
                  <Td>
                    <Link
                      href={`/admin/students/${student.id}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      {student.firstName} {student.lastName}
                    </Link>
                  </Td>
                  <Td>{student.class?.name ?? "Unassigned"}</Td>
                  <Td>
                    <Badge tone={statusTone[student.status]}>{student.status}</Badge>
                  </Td>
                </Tr>
              ))}
              {students.length === 0 ? (
                <Tr>
                  <Td colSpan={4} className="text-center text-slate-400">
                    No students yet
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          </Table>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>New student</CardTitle>
          </CardHeader>
          <CardBody>
            <StudentForm classes={classes} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
