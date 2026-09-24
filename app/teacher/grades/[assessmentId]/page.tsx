import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { MarksForm } from "@/components/forms/marks-form";

export default async function AssessmentMarksPage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const session = await requireRole("TEACHER");
  const { assessmentId } = await params;

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { class: true, subject: true, term: true },
  });
  if (!assessment) notFound();

  const assignment = await prisma.classSubjectTeacher.findFirst({
    where: {
      classId: assessment.classId,
      subjectId: assessment.subjectId,
      termId: assessment.termId,
      teacherId: session.userId,
    },
  });
  if (!assignment) notFound();

  const [students, marks] = await Promise.all([
    prisma.student.findMany({
      where: { classId: assessment.classId, status: "ACTIVE" },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
    prisma.mark.findMany({ where: { assessmentId } }),
  ]);
  const markByStudent = new Map(marks.map((m) => [m.studentId, m]));

  return (
    <div>
      <PageHeader
        title={assessment.name}
        description={`${assessment.class.name} · ${assessment.subject.name} · ${assessment.term.name}`}
      />
      <Card>
        <CardBody>
          <MarksForm
            assessmentId={assessment.id}
            maxScore={assessment.maxScore}
            students={students.map((s) => {
              const mark = markByStudent.get(s.id);
              return {
                id: s.id,
                name: `${s.firstName} ${s.lastName}`,
                admissionNo: s.admissionNo,
                score: mark?.score ?? null,
                remarks: mark?.remarks ?? null,
              };
            })}
          />
        </CardBody>
      </Card>
    </div>
  );
}
