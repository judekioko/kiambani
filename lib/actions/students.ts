"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { createStudentSchema } from "@/lib/validators/student";
import { generateTempPassword } from "@/lib/password";
import type { ActionState } from "./types";

export async function createStudent(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");

  const parsed = createStudentSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    admissionNo: formData.get("admissionNo"),
    dob: formData.get("dob"),
    gender: formData.get("gender"),
    classId: formData.get("classId") || undefined,
    guardianName: formData.get("guardianName"),
    guardianEmail: formData.get("guardianEmail"),
    guardianPhone: formData.get("guardianPhone"),
    guardianRelationship: formData.get("guardianRelationship"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  const existingAdmission = await prisma.student.findUnique({
    where: { admissionNo: data.admissionNo },
  });
  if (existingAdmission) return { error: "A student with this admission number already exists" };

  let guardian = await prisma.user.findUnique({ where: { email: data.guardianEmail } });
  let tempPassword: string | null = null;

  if (!guardian) {
    tempPassword = generateTempPassword();
    guardian = await prisma.user.create({
      data: {
        name: data.guardianName,
        email: data.guardianEmail,
        phone: data.guardianPhone,
        role: "PARENT",
        passwordHash: await bcrypt.hash(tempPassword, 10),
      },
    });
  } else if (guardian.role !== "PARENT") {
    return { error: "This email belongs to a non-parent account already" };
  } else if (!guardian.phone) {
    guardian = await prisma.user.update({
      where: { id: guardian.id },
      data: { phone: data.guardianPhone },
    });
  }

  await prisma.student.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      admissionNo: data.admissionNo,
      dob: new Date(data.dob),
      gender: data.gender,
      classId: data.classId || null,
      guardians: {
        create: {
          guardianId: guardian.id,
          relationship: data.guardianRelationship,
          isPrimary: true,
        },
      },
    },
  });

  revalidatePath("/admin/students");
  return {
    success: tempPassword
      ? `Student created. New guardian login: ${data.guardianEmail} / ${tempPassword}`
      : "Student created and linked to existing guardian",
  };
}

export async function updateGuardianPhone(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");

  const guardianId = String(formData.get("guardianId") ?? "");
  const studentId = String(formData.get("studentId") ?? "");
  const phone = String(formData.get("phone") ?? "").trim();
  if (!phone) return { error: "Phone number is required" };

  await prisma.user.update({ where: { id: guardianId }, data: { phone } });

  revalidatePath(`/admin/students/${studentId}`);
  return { success: "Phone number updated" };
}

export async function updateStudentStatus(
  studentId: string,
  status: "ACTIVE" | "TRANSFERRED" | "GRADUATED" | "INACTIVE"
) {
  await requireRole("ADMIN");
  await prisma.student.update({ where: { id: studentId }, data: { status } });
  revalidatePath("/admin/students");
}
