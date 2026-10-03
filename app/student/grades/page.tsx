import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getMyStudents } from "@/lib/my-student";
import { computeReportCard } from "@/lib/report-card";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportCardTable } from "@/components/report-card-table";

export default async function StudentGradesPage() {
  const session = await requireRole("STUDENT");
  const students = await getMyStudents(session.userId);
  const currentTerm = await prisma.term.findFirst({ where: { isCurrent: true } });

  const reportCards = currentTerm
    ? await Promise.all(students.map((s) => computeReportCard(s.id, currentTerm.id)))
    : [];

  return (
    <div>
      <PageHeader
        title="Results"
        description={currentTerm ? `Your results for ${currentTerm.name}` : "No current semester set"}
      />
      <div className="space-y-6">
        {students.map((student, i) => (
          <Card key={student.id}>
            <CardHeader>
              <CardTitle>
                {student.firstName} {student.lastName} · {student.class?.name ?? "Unassigned"}
              </CardTitle>
            </CardHeader>
            <CardBody>
              {reportCards[i] ? (
                <ReportCardTable
                  rows={reportCards[i].rows}
                  overallPercent={reportCards[i].overallPercent}
                />
              ) : (
                <p className="text-sm text-slate-500">No current semester set.</p>
              )}
            </CardBody>
          </Card>
        ))}
        {students.length === 0 ? (
          <p className="text-sm text-slate-500">Your account is not linked to a student record yet. Please contact the college office.</p>
        ) : null}
      </div>
    </div>
  );
}
