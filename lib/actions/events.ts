"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { createEventSchema } from "@/lib/validators/event";
import type { ActionState } from "./types";

export async function createEvent(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("ADMIN", "TEACHER");

  const parsed = createEventSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    audience: formData.get("audience"),
    classId: formData.get("classId") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  if (session.role === "TEACHER") {
    if (parsed.data.audience !== "CLASS" || !parsed.data.classId) {
      return { error: "Trainers can only add events for their own course" };
    }
    const cls = await prisma.schoolClass.findUnique({ where: { id: parsed.data.classId } });
    if (!cls || cls.classTeacherId !== session.userId) {
      return { error: "You are not the coordinator of this course" };
    }
  }

  if (parsed.data.audience === "CLASS" && !parsed.data.classId) {
    return { error: "Select a course for a course-scoped event" };
  }

  await prisma.schoolEvent.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      startDate: new Date(parsed.data.startDate),
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      audience: parsed.data.audience,
      classId: parsed.data.audience === "CLASS" ? parsed.data.classId : null,
      authorId: session.userId,
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/teacher/events");
  revalidatePath("/student/events");
  return { success: "Event added" };
}
