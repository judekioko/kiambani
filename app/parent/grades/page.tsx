import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getGuardianStudents } from "@/lib/guardian";
import { computeReportCard } from "@/lib/report-card";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportCardTable } from "@/components/report-card-table";

export default async function ParentGradesPage() {
  const session = await requireRole("PARENT");
  const students = await getGuardianStudents(session.userId);
  const currentTerm = await prisma.term.findFirst({ where: { isCurrent: true } });

  const reportCards = currentTerm
    ? await Promise.all(students.map((s) => computeReportCard(s.id, currentTerm.id)))
    : [];

  return (
    <div>
      <PageHeader
        title="Grades"
        description={currentTerm ? `Report card for ${currentTerm.name}` : "No current term set"}
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
                <p className="text-sm text-slate-500">No current term set.</p>
              )}
            </CardBody>
          </Card>
        ))}
        {students.length === 0 ? (
          <p className="text-sm text-slate-500">No children linked to your account.</p>
        ) : null}
      </div>
    </div>
  );
}
