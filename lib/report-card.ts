import { prisma } from "@/lib/prisma";

export type ReportCardRow = {
  subject: string;
  totalScore: number;
  totalMax: number;
  percent: number;
  letter: string | null;
  comment: string | null;
};

export async function computeReportCard(studentId: string, termId: string) {
  const marks = await prisma.mark.findMany({
    where: { studentId, assessment: { termId } },
    include: { assessment: { include: { subject: true } } },
  });

  const scale = await prisma.gradingScale.findFirst({
    include: { bands: true },
    orderBy: { id: "asc" },
  });

  const bySubject = new Map<string, { totalScore: number; totalMax: number }>();
  for (const mark of marks) {
    const key = mark.assessment.subject.name;
    const entry = bySubject.get(key) ?? { totalScore: 0, totalMax: 0 };
    entry.totalScore += mark.score;
    entry.totalMax += mark.assessment.maxScore;
    bySubject.set(key, entry);
  }

  const rows: ReportCardRow[] = Array.from(bySubject.entries()).map(([subject, totals]) => {
    const percent = totals.totalMax > 0 ? (totals.totalScore / totals.totalMax) * 100 : 0;
    const band = scale?.bands.find((b) => percent >= b.minPercent && percent <= b.maxPercent);
    return {
      subject,
      totalScore: totals.totalScore,
      totalMax: totals.totalMax,
      percent: Math.round(percent * 10) / 10,
      letter: band?.letter ?? null,
      comment: band?.comment ?? null,
    };
  });

  const overallPercent =
    rows.length > 0 ? rows.reduce((sum, r) => sum + r.percent, 0) / rows.length : 0;

  return {
    rows: rows.sort((a, b) => a.subject.localeCompare(b.subject)),
    overallPercent: Math.round(overallPercent * 10) / 10,
  };
}
