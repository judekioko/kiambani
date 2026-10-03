"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getStudentFinance } from "@/lib/finance";
import { formatKes } from "@/lib/format";
import type { ActionState } from "./types";

function refresh() {
  revalidatePath("/student");
  revalidatePath("/student/registration");
  revalidatePath("/student/exam-card");
}

export async function registerUnits(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("STUDENT");

  const subjectIds = formData.getAll("subjectId").map(String);
  if (subjectIds.length === 0) return { error: "Select at least one unit to register" };

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) return { error: "Your account is not linked to a student record" };
  if (student.status !== "ACTIVE") return { error: "Only active students can register for units" };
  if (!student.classId) return { error: "You have not been assigned to a course yet" };

  const term = await prisma.term.findFirst({ where: { isCurrent: true } });
  if (!term) return { error: "There is no current semester open for registration" };

  const finance = await getStudentFinance(student.id);
  if (!finance.currentInvoice) {
    return { error: "Fees for this semester have not been billed yet. Contact the finance office." };
  }
  if (!finance.cleared) {
    return {
      error: `Clear your fee balance of ${formatKes(finance.balance)} before registering for units.`,
    };
  }

  const offered = await prisma.classSubjectTeacher.findMany({
    where: { classId: student.classId, termId: term.id },
    select: { subjectId: true },
  });
  const allowed = new Set(offered.map((o) => o.subjectId));
  if (!subjectIds.every((id) => allowed.has(id))) {
    return { error: "Some selected units are not offered for your course this semester" };
  }

  const result = await prisma.unitRegistration.createMany({
    data: subjectIds.map((subjectId) => ({
      studentId: student.id,
      subjectId,
      termId: term.id,
    })),
    skipDuplicates: true,
  });

  refresh();
  return { success: `Registered ${result.count} unit(s) for ${term.name}` };
}

export async function dropUnit(registrationId: string) {
  const session = await requireRole("STUDENT");
  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) return;

  const term = await prisma.term.findFirst({ where: { isCurrent: true } });
  await prisma.unitRegistration.deleteMany({
    where: { id: registrationId, studentId: student.id, termId: term?.id },
  });
  refresh();
}
