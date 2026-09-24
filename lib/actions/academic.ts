"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import {
  academicYearSchema,
  termSchema,
  subjectSchema,
  schoolClassSchema,
  classSubjectTeacherSchema,
} from "@/lib/validators/academic";
import type { ActionState } from "./types";

function firstError(error: { issues: { message: string }[] }) {
  return error.issues[0]?.message ?? "Invalid input";
}

export async function createAcademicYear(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = academicYearSchema.safeParse({
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const makeCurrent = formData.get("isCurrent") === "on";

  await prisma.$transaction(async (tx) => {
    if (makeCurrent) {
      await tx.academicYear.updateMany({ data: { isCurrent: false } });
    }
    await tx.academicYear.create({
      data: {
        name: parsed.data.name,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        isCurrent: makeCurrent,
      },
    });
  });

  revalidatePath("/admin/academic-years");
  return { success: "Academic year created" };
}

export async function createTerm(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = termSchema.safeParse({
    academicYearId: formData.get("academicYearId"),
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const makeCurrent = formData.get("isCurrent") === "on";

  await prisma.$transaction(async (tx) => {
    if (makeCurrent) {
      await tx.term.updateMany({ data: { isCurrent: false } });
    }
    await tx.term.create({
      data: {
        academicYearId: parsed.data.academicYearId,
        name: parsed.data.name,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        isCurrent: makeCurrent,
      },
    });
  });

  revalidatePath(`/admin/academic-years/${parsed.data.academicYearId}`);
  return { success: "Term created" };
}

export async function createSubject(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = subjectSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const existing = await prisma.subject.findUnique({ where: { code: parsed.data.code } });
  if (existing) return { error: "A subject with this code already exists" };

  await prisma.subject.create({ data: parsed.data });
  revalidatePath("/admin/subjects");
  return { success: "Subject created" };
}

export async function createSchoolClass(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const raw = {
    name: formData.get("name"),
    academicYearId: formData.get("academicYearId"),
    classTeacherId: formData.get("classTeacherId") || undefined,
  };
  const parsed = schoolClassSchema.safeParse(raw);
  if (!parsed.success) return { error: firstError(parsed.error) };

  await prisma.schoolClass.create({
    data: {
      name: parsed.data.name,
      academicYearId: parsed.data.academicYearId,
      classTeacherId: parsed.data.classTeacherId || null,
    },
  });

  revalidatePath("/admin/classes");
  return { success: "Class created" };
}

export async function assignClassSubjectTeacher(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = classSubjectTeacherSchema.safeParse({
    classId: formData.get("classId"),
    subjectId: formData.get("subjectId"),
    teacherId: formData.get("teacherId"),
    termId: formData.get("termId"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const existing = await prisma.classSubjectTeacher.findUnique({
    where: {
      classId_subjectId_termId: {
        classId: parsed.data.classId,
        subjectId: parsed.data.subjectId,
        termId: parsed.data.termId,
      },
    },
  });
  if (existing) {
    await prisma.classSubjectTeacher.update({
      where: { id: existing.id },
      data: { teacherId: parsed.data.teacherId },
    });
  } else {
    await prisma.classSubjectTeacher.create({ data: parsed.data });
  }

  revalidatePath(`/admin/classes/${parsed.data.classId}`);
  return { success: "Assignment saved" };
}

export async function removeClassSubjectTeacher(classId: string, id: string) {
  await requireRole("ADMIN");
  await prisma.classSubjectTeacher.delete({ where: { id } });
  revalidatePath(`/admin/classes/${classId}`);
}
