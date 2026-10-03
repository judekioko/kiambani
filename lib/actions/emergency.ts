"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { sendSms } from "@/lib/sms";
import type { ActionState } from "./types";

export async function sendEmergencyBroadcast(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("ADMIN");

  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!title || !message) return { error: "Title and message are required" };

  await prisma.announcement.create({
    data: {
      title,
      body: message,
      audience: "ALL",
      authorId: session.userId,
    },
  });

  const students = await prisma.user.findMany({
    where: { role: "STUDENT", active: true, phone: { not: null } },
    select: { phone: true },
  });
  const phones = students.map((s) => s.phone).filter((p): p is string => Boolean(p));

  const result = await sendSms(phones, `${title}: ${message}`);

  await prisma.emergencyBroadcast.create({
    data: {
      message: `${title}: ${message}`,
      sentCount: result.sent,
      failedCount: result.failed,
      smsConfigured: result.configured,
      sentById: session.userId,
    },
  });

  revalidatePath("/admin/emergency");
  revalidatePath("/admin/announcements");

  if (!result.configured) {
    return {
      success: `Announcement posted. SMS is not configured yet (${phones.length} student phone numbers on file) — add AFRICASTALKING_API_KEY to send real texts.`,
    };
  }
  if (result.error) {
    return { error: `Announcement posted, but SMS failed: ${result.error}` };
  }
  return { success: `Announcement posted and SMS sent to ${result.sent} of ${phones.length} students.` };
}
