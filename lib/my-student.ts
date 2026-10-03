import { prisma } from "@/lib/prisma";

export async function getMyStudents(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { class: true },
  });
  return student ? [student] : [];
}

export async function getMyStudent(userId: string) {
  return prisma.student.findUnique({
    where: { userId },
    include: { class: { include: { academicYear: true } } },
  });
}

export async function getCurrentTerm() {
  return prisma.term.findFirst({
    where: { isCurrent: true },
    include: { academicYear: true },
  });
}

export function sessionProgress(start: Date, end: Date, now = new Date()): number {
  const total = end.getTime() - start.getTime();
  if (total <= 0) return 0;
  const pct = ((now.getTime() - start.getTime()) / total) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}
