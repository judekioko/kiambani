"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { gradingScaleSchema, gradeBandSchema, assessmentSchema } from "@/lib/validators/grading";
import type { ActionState } from "./types";

function firstError(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Invalid input";
}

export async function createGradingScale(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = gradingScaleSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const existing = await prisma.gradingScale.findUnique({ where: { name: parsed.data.name } });
  if (existing) return { error: "A grading scale with this name already exists" };

  await prisma.gradingScale.create({ data: parsed.data });
  revalidatePath("/admin/grading-scales");
  return { success: "Grading scale created" };
}

export async function createGradeBand(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = gradeBandSchema.safeParse({
    gradingScaleId: formData.get("gradingScaleId"),
    minPercent: formData.get("minPercent"),
    maxPercent: formData.get("maxPercent"),
    letter: formData.get("letter"),
    comment: formData.get("comment") || undefined,
  });
  if (!parsed.success) return { error: firstError(parsed.error) };
  if (parsed.data.minPercent > parsed.data.maxPercent) {
    return { error: "Minimum percent cannot exceed maximum percent" };
  }

  await prisma.gradeBand.create({ data: parsed.data });
  revalidatePath(`/admin/grading-scales/${parsed.data.gradingScaleId}`);
  return { success: "Band added" };
}

export async function createAssessment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("TEACHER", "ADMIN");
  const parsed = assessmentSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    maxScore: formData.get("maxScore"),
    termId: formData.get("termId"),
    classId: formData.get("classId"),
    subjectId: formData.get("subjectId"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  if (session.role === "TEACHER") {
    const assignment = await prisma.classSubjectTeacher.findFirst({
      where: {
        classId: parsed.data.classId,
        subjectId: parsed.data.subjectId,
        termId: parsed.data.termId,
        teacherId: session.userId,
      },
    });
    if (!assignment) return { error: "You are not assigned to train this unit/course/semester" };
  }

  await prisma.assessment.create({ data: parsed.data });
  revalidatePath("/teacher/grades");
  return { success: "Assessment created" };
}

export async function saveMarks(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("TEACHER", "ADMIN");
  const assessmentId = String(formData.get("assessmentId") ?? "");
  const assessment = await prisma.assessment.findUnique({ where: { id: assessmentId } });
  if (!assessment) return { error: "Assessment not found" };

  if (session.role === "TEACHER") {
    const assignment = await prisma.classSubjectTeacher.findFirst({
      where: {
        classId: assessment.classId,
        subjectId: assessment.subjectId,
        termId: assessment.termId,
        teacherId: session.userId,
      },
    });
    if (!assignment) return { error: "You are not assigned to train this unit/course/semester" };
  }

  const studentIds = formData.getAll("studentId").map(String);

  await prisma.$transaction(
    studentIds.map((studentId) => {
      const rawScore = formData.get(`score_${studentId}`);
      const score = rawScore ? Number(rawScore) : 0;
      const remarks = String(formData.get(`remarks_${studentId}`) ?? "") || null;

      return prisma.mark.upsert({
        where: { assessmentId_studentId: { assessmentId, studentId } },
        update: { score, remarks },
        create: { assessmentId, studentId, score, remarks },
      });
    })
  );

  revalidatePath("/teacher/grades");
  return { success: `Marks saved for ${studentIds.length} students` };
}
