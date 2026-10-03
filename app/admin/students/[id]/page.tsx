import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StudentStatusForm } from "@/components/forms/student-status-form";
import { StudentContactForm } from "@/components/forms/student-contact-form";
import { HostelForm } from "@/components/forms/hostel-form";
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
      user: true,
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
        description={`Admission No. ${student.admissionNo} · ${student.class?.name ?? "Unassigned course"}`}
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
            <CardTitle>Login &amp; contact</CardTitle>
          </CardHeader>
          <CardBody className="text-sm">
            <StudentContactForm
              studentId={student.id}
              hasLogin={Boolean(student.user)}
              initialEmail={student.user?.email ?? ""}
              initialPhone={student.user?.phone ?? ""}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hostel</CardTitle>
          </CardHeader>
          <CardBody className="text-sm">
            <HostelForm
              studentId={student.id}
              hostelName={student.hostelName}
              hostelRoom={student.hostelRoom}
            />
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Results</CardTitle>
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
              <p className="text-sm text-slate-500">No semesters have been set up yet.</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
