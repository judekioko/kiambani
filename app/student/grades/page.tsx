import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getMyStudent } from "@/lib/my-student";
import { computeReportCard } from "@/lib/report-card";
import { COLLEGE_NAME } from "@/lib/brand";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportCardTable } from "@/components/report-card-table";
import { PrintButton } from "@/components/print-button";

export default async function StudentResultsPage() {
  const session = await requireRole("STUDENT");
  const student = await getMyStudent(session.userId);

  if (!student) {
    return (
      <div>
        <PageHeader title="Results" />
        <p className="text-sm text-slate-500">
          Your account is not linked to a student record yet. Please contact the college office.
        </p>
      </div>
    );
  }

  const assessed = await prisma.assessment.findMany({
    where: { marks: { some: { studentId: student.id } } },
    select: { termId: true },
    distinct: ["termId"],
  });
  const terms = await prisma.term.findMany({
    where: { id: { in: assessed.map((a) => a.termId) } },
    include: { academicYear: true },
    orderBy: { startDate: "asc" },
  });
  const cards = await Promise.all(
    terms.map(async (term) => ({ term, card: await computeReportCard(student.id, term.id) }))
  );

  const years = new Map<string, { name: string; items: typeof cards }>();
  for (const item of cards) {
    const key = item.term.academicYearId;
    if (!years.has(key)) years.set(key, { name: item.term.academicYear.name, items: [] });
    years.get(key)!.items.push(item);
  }

  const overall =
    cards.length > 0
      ? Math.round((cards.reduce((s, c) => s + c.card.overallPercent, 0) / cards.length) * 10) / 10
      : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Results"
        description="Your results for every academic year and semester."
        action={cards.length > 0 ? <PrintButton label="Print results" /> : null}
      />

      <div className="hidden text-center print:block">
        <h1 className="text-lg font-semibold uppercase">{COLLEGE_NAME}</h1>
        <p className="text-sm uppercase tracking-wide text-slate-500">Academic results</p>
        <p className="mt-2 text-sm">
          {student.firstName} {student.lastName} · {student.admissionNo} ·{" "}
          {student.class?.name ?? ""}
        </p>
      </div>

      {cards.length === 0 ? (
        <p className="text-sm text-slate-500">No results have been published for you yet.</p>
      ) : (
        <>
          <Card>
            <CardBody className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
              <p>
                <span className="text-slate-500">Semesters with results:</span>{" "}
                <b className="text-slate-900">{cards.length}</b>
              </p>
              <p>
                <span className="text-slate-500">Overall average:</span>{" "}
                <b className="text-slate-900">{overall}%</b>
              </p>
            </CardBody>
          </Card>

          {[...years.values()].map((year) => (
            <section key={year.name} className="space-y-4">
              <h2 className="text-base font-semibold text-slate-900">
                Academic Year {year.name}
              </h2>
              {year.items.map(({ term, card }) => (
                <Card key={term.id}>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>{term.name}</CardTitle>
                    <span className="text-sm text-slate-500">Average {card.overallPercent}%</span>
                  </CardHeader>
                  <CardBody>
                    <ReportCardTable rows={card.rows} overallPercent={card.overallPercent} />
                  </CardBody>
                </Card>
              ))}
            </section>
          ))}
        </>
      )}
    </div>
  );
}
