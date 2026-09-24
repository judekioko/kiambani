import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StudentStatusForm } from "@/components/forms/student-status-form";
import { GuardianPhoneForm } from "@/components/forms/guardian-phone-form";
import { computeReportCard } from "@/lib/report-card";
import { ReportCardTable } from "@/components/report-card-table";

const statusTone = {
  ACTIVE: "emerald",
  TRANSFERRED: "amber",
  GRADUATED: "slate",
  INACTIVE: "rose",
} as const;

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ termId?: string }>;
}) {
  const { id } = await params;
  const { termId: requestedTermId } = await searchParams;
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: true,
      guardians: { include: { guardian: true } },
    },
  });
  if (!student) notFound();

  const terms = await prisma.term.findMany({ orderBy: { startDate: "desc" } });
  const termId = requestedTermId ?? terms.find((t) => t.isCurrent)?.id ?? terms[0]?.id;
  const reportCard = termId ? await computeReportCard(student.id, termId) : null;

  return (
    <div>
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        description={`Admission No. ${student.admissionNo} · ${student.class?.name ?? "Unassigned class"}`}
        action={<Badge tone={statusTone[student.status]}>{student.status}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 text-sm">
            <p>
              <span className="text-slate-500">Date of birth:</span>{" "}
              {student.dob.toLocaleDateString()}
            </p>
            <p>
              <span className="text-slate-500">Gender:</span> {student.gender}
            </p>
            <p>
              <span className="text-slate-500">Enrolled:</span>{" "}
              {student.enrollmentDate.toLocaleDateString()}
            </p>
            <div className="pt-2">
              <StudentStatusForm studentId={student.id} status={student.status} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Guardians</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            {student.guardians.map((g) => (
              <div key={g.id} className="space-y-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{g.guardian.name}</p>
                    <p className="text-xs text-slate-500">
                      {g.relationship} · {g.guardian.email}
                    </p>
                  </div>
                  {g.isPrimary ? <Badge tone="emerald">Primary</Badge> : null}
                </div>
                <GuardianPhoneForm
                  studentId={student.id}
                  guardianId={g.guardian.id}
                  initialPhone={g.guardian.phone}
                />
              </div>
            ))}
            {student.guardians.length === 0 ? (
              <p className="text-slate-400">No guardians linked</p>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Report card</CardTitle>
            <form className="flex items-center gap-2" method="get">
              <Select name="termId" defaultValue={termId}>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </Select>
              <Button type="submit" size="sm" variant="secondary">
                View
              </Button>
            </form>
          </CardHeader>
          <CardBody>
            {reportCard ? (
              <ReportCardTable rows={reportCard.rows} overallPercent={reportCard.overallPercent} />
            ) : (
              <p className="text-sm text-slate-500">No terms have been set up yet.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
