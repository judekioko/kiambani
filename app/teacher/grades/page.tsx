import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { AssessmentForm } from "@/components/forms/assessment-form";

export default async function TeacherGradesPage() {
  const session = await requireRole("TEACHER");

  const assignments = await prisma.classSubjectTeacher.findMany({
    where: { teacherId: session.userId },
    include: { class: true, subject: true, term: true },
    orderBy: { class: { name: "asc" } },
  });

  const assessments = await prisma.assessment.findMany({
    where: {
      classId: { in: assignments.map((a) => a.classId) },
      subjectId: { in: assignments.map((a) => a.subjectId) },
    },
    include: { class: true, subject: true, term: true, _count: { select: { marks: true } } },
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <PageHeader title="Grades" description="Create assessments and enter marks." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <Thead>
              <Tr>
                <Th>Assessment</Th>
                <Th>Class</Th>
                <Th>Subject</Th>
                <Th>Term</Th>
                <Th>Marks entered</Th>
              </Tr>
            </Thead>
            <Tbody>
              {assessments.map((assessment) => (
                <Tr key={assessment.id}>
                  <Td>
                    <Link
                      href={`/teacher/grades/${assessment.id}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      {assessment.name}
                    </Link>
                  </Td>
                  <Td>{assessment.class.name}</Td>
                  <Td>{assessment.subject.name}</Td>
                  <Td>{assessment.term.name}</Td>
                  <Td>{assessment._count.marks}</Td>
                </Tr>
              ))}
              {assessments.length === 0 ? (
                <Tr>
                  <Td colSpan={5} className="text-center text-slate-400">
                    No assessments yet
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          </Table>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>New assessment</CardTitle>
          </CardHeader>
          <CardBody>
            {assignments.length === 0 ? (
              <p className="text-sm text-slate-500">
                You have not been assigned to teach any class/subject yet.
              </p>
            ) : (
              <AssessmentForm
                assignments={assignments.map((a) => ({
                  id: a.id,
                  classId: a.classId,
                  subjectId: a.subjectId,
                  termId: a.termId,
                  label: `${a.class.name} · ${a.subject.name} · ${a.term.name}`,
                }))}
              />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
