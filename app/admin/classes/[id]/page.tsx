import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AssignmentForm } from "@/components/forms/assignment-form";
import { removeClassSubjectTeacher } from "@/lib/actions/academic";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const cls = await prisma.schoolClass.findUnique({
    where: { id },
    include: {
      academicYear: { include: { terms: true } },
      classTeacher: true,
      students: { orderBy: { lastName: "asc" } },
      classSubjectTeachers: { include: { subject: true, teacher: true, term: true } },
    },
  });
  if (!cls) notFound();

  const [subjects, teachers] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { role: "TEACHER" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title={cls.name}
        description={`${cls.academicYear.name} · Course Coordinator: ${cls.classTeacher?.name ?? "Unassigned"}`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Unit trainers</CardTitle>
            </CardHeader>
            <CardBody>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Semester</Th>
                    <Th>Unit</Th>
                    <Th>Trainer</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {cls.classSubjectTeachers.map((assignment) => (
                    <Tr key={assignment.id}>
                      <Td>{assignment.term.name}</Td>
                      <Td>{assignment.subject.name}</Td>
                      <Td>{assignment.teacher.name}</Td>
                      <Td>
                        <form
                          action={async () => {
                            "use server";
                            await removeClassSubjectTeacher(cls.id, assignment.id);
                          }}
                        >
                          <Button type="submit" size="sm" variant="danger">
                            Remove
                          </Button>
                        </form>
                      </Td>
                    </Tr>
                  ))}
                  {cls.classSubjectTeachers.length === 0 ? (
                    <Tr>
                      <Td colSpan={4} className="text-center text-slate-400">
                        No unit trainers assigned yet
                      </Td>
                    </Tr>
                  ) : null}
                </Tbody>
              </Table>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Students ({cls.students.length})</CardTitle>
            </CardHeader>
            <CardBody>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Admission No.</Th>
                    <Th>Name</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {cls.students.map((student) => (
                    <Tr key={student.id}>
                      <Td>{student.admissionNo}</Td>
                      <Td>
                        {student.firstName} {student.lastName}
                      </Td>
                      <Td>{student.status}</Td>
                    </Tr>
                  ))}
                  {cls.students.length === 0 ? (
                    <Tr>
                      <Td colSpan={3} className="text-center text-slate-400">
                        No students in this course yet
                      </Td>
                    </Tr>
                  ) : null}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Assign unit trainer</CardTitle>
          </CardHeader>
          <CardBody>
            {cls.academicYear.terms.length === 0 || subjects.length === 0 || teachers.length === 0 ? (
              <p className="text-sm text-slate-500">
                You need at least one semester, one unit, and one trainer before making
                assignments.
              </p>
            ) : (
              <AssignmentForm
                classId={cls.id}
                subjects={subjects}
                teachers={teachers}
                terms={cls.academicYear.terms}
              />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
