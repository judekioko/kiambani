"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { collegeSettingsSchema, hostelSchema } from "@/lib/validators/student-portal";
import { COLLEGE_NAME } from "@/lib/brand";
import type { ActionState } from "./types";

const blankToNull = (v: string | undefined) => (v && v.length > 0 ? v : null);

export async function updateCollegeSettings(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");

  const parsed = collegeSettingsSchema.safeParse({
    address: formData.get("address") || undefined,
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    bankName: formData.get("bankName") || undefined,
    bankAccountName: formData.get("bankAccountName") || undefined,
    bankAccountNumber: formData.get("bankAccountNumber") || undefined,
    bankBranch: formData.get("bankBranch") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const d = parsed.data;

  const values = {
    address: blankToNull(d.address),
    phone: blankToNull(d.phone),
    email: blankToNull(d.email),
    bankName: blankToNull(d.bankName),
    bankAccountName: blankToNull(d.bankAccountName),
    bankAccountNumber: blankToNull(d.bankAccountNumber),
    bankBranch: blankToNull(d.bankBranch),
  };

  const existing = await prisma.school.findFirst();
  if (existing) {
    await prisma.school.update({ where: { id: existing.id }, data: values });
  } else {
    await prisma.school.create({ data: { name: COLLEGE_NAME, ...values } });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/student/pay");
  return { success: "College settings saved" };
}

export async function updateStudentHostel(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");

  const parsed = hostelSchema.safeParse({
    studentId: formData.get("studentId"),
    hostelName: formData.get("hostelName") || undefined,
    hostelRoom: formData.get("hostelRoom") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  await prisma.student.update({
    where: { id: parsed.data.studentId },
    data: {
      hostelName: blankToNull(parsed.data.hostelName),
      hostelRoom: blankToNull(parsed.data.hostelRoom),
    },
  });

  revalidatePath(`/admin/students/${parsed.data.studentId}`);
  revalidatePath("/student");
  return { success: "Hostel details saved" };
}
