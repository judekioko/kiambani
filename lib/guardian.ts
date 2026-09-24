import { prisma } from "@/lib/prisma";

export async function getGuardianStudents(guardianId: string) {
  const links = await prisma.studentGuardian.findMany({
    where: { guardianId },
    include: { student: { include: { class: true } } },
  });
  return links.map((l) => l.student);
}
