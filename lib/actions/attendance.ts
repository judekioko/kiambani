"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { markAttendanceSchema, attendanceStatusValues } from "@/lib/validators/attendance";
import type { ActionState } from "./types";

export async function markAttendance(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("TEACHER", "ADMIN");

  const parsed = markAttendanceSchema.safeParse({
    classId: formData.get("classId"),
    termId: formData.get("termId"),
    date: formData.get("date"),
  });
  if (!parsed.success) return { error: "Missing class, term, or date" };

  const cls = await prisma.schoolClass.findUnique({ where: { id: parsed.data.classId } });
  if (!cls) return { error: "Class not found" };
  if (session.role === "TEACHER" && cls.classTeacherId !== session.userId) {
    return { error: "You are not the class teacher for this class" };
  }

  const date = new Date(parsed.data.date);
  const studentIds = formData.getAll("studentId").map(String);

  await prisma.$transaction(
    studentIds.map((studentId) => {
      const status = String(formData.get(`status_${studentId}`) ?? "PRESENT");
      const safeStatus = attendanceStatusValues.includes(status as never)
        ? (status as (typeof attendanceStatusValues)[number])
        : "PRESENT";

      return prisma.attendanceRecord.upsert({
        where: { studentId_date: { studentId, date } },
        update: { status: safeStatus, markedById: session.userId, classId: cls.id, termId: parsed.data.termId },
        create: {
          studentId,
          classId: cls.id,
          termId: parsed.data.termId,
          date,
          status: safeStatus,
          markedById: session.userId,
        },
      });
    })
  );

  revalidatePath("/teacher/attendance");
  revalidatePath("/admin/attendance");
  return { success: `Attendance saved for ${studentIds.length} students` };
}
