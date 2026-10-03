import { prisma } from "@/lib/prisma";

export async function getMyStudents(userId: string) {
  const student = await prisma.student.findUnique({
    where: { userId },
    include: { class: true },
  });
  return student ? [student] : [];
}
