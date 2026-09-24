"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { createAnnouncementSchema } from "@/lib/validators/announcement";
import type { ActionState } from "./types";

export async function createAnnouncement(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("ADMIN", "TEACHER");

  const parsed = createAnnouncementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    audience: formData.get("audience"),
    classId: formData.get("classId") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  if (session.role === "TEACHER") {
    if (parsed.data.audience !== "CLASS" || !parsed.data.classId) {
      return { error: "Teachers can only post announcements to their own class" };
    }
    const cls = await prisma.schoolClass.findUnique({ where: { id: parsed.data.classId } });
    if (!cls || cls.classTeacherId !== session.userId) {
      return { error: "You are not the class teacher for this class" };
    }
  }

  if (parsed.data.audience === "CLASS" && !parsed.data.classId) {
    return { error: "Select a class for a class-scoped announcement" };
  }

  await prisma.announcement.create({
    data: {
      title: parsed.data.title,
      body: parsed.data.body,
      audience: parsed.data.audience,
      classId: parsed.data.audience === "CLASS" ? parsed.data.classId : null,
      authorId: session.userId,
    },
  });

  revalidatePath("/admin/announcements");
  revalidatePath("/teacher/announcements");
  revalidatePath("/accountant/announcements");
  revalidatePath("/parent/announcements");
  return { success: "Announcement posted" };
}
