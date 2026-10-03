"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { createStudentSchema, updateStudentContactSchema } from "@/lib/validators/student";
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
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  const existingAdmission = await prisma.student.findUnique({
    where: { admissionNo: data.admissionNo },
  });
  if (existingAdmission) return { error: "A student with this admission number already exists" };

  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) return { error: "This email is already used by another account" };

  const tempPassword = generateTempPassword();

  await prisma.student.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      admissionNo: data.admissionNo,
      dob: new Date(data.dob),
      gender: data.gender,
      ...(data.classId ? { class: { connect: { id: data.classId } } } : {}),
      user: {
        create: {
          name: `${data.firstName} ${data.lastName}`,
          email: data.email,
          phone: data.phone,
          role: "STUDENT",
          passwordHash: await bcrypt.hash(tempPassword, 10),
        },
      },
    },
  });

  revalidatePath("/admin/students");
  return { success: `Student enrolled. Login: ${data.email} / ${tempPassword}` };
}

export async function createStudentLogin(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");

  const parsed = updateStudentContactSchema.safeParse({
    studentId: formData.get("studentId"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { studentId, email, phone } = parsed.data;

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) return { error: "Student not found" };
  if (student.userId) return { error: "This student already has a login" };

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return { error: "This email is already used by another account" };

  const tempPassword = generateTempPassword();

  await prisma.student.update({
    where: { id: studentId },
    data: {
      user: {
        create: {
          name: `${student.firstName} ${student.lastName}`,
          email,
          phone,
          role: "STUDENT",
          passwordHash: await bcrypt.hash(tempPassword, 10),
        },
      },
    },
  });

  revalidatePath(`/admin/students/${studentId}`);
  return { success: `Login created: ${email} / ${tempPassword}` };
}

export async function updateStudentContact(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");

  const parsed = updateStudentContactSchema.safeParse({
    studentId: formData.get("studentId"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const { studentId, email, phone } = parsed.data;

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student?.userId) return { error: "This student has no login yet" };

  const existingWithEmail = await prisma.user.findUnique({ where: { email } });
  if (existingWithEmail && existingWithEmail.id !== student.userId) {
    return { error: "This email is already used by another account" };
  }

  await prisma.user.update({ where: { id: student.userId }, data: { email, phone } });

  revalidatePath(`/admin/students/${studentId}`);
  return { success: "Contact details updated" };
}

export async function updateStudentStatus(
  studentId: string,
  status: "ACTIVE" | "TRANSFERRED" | "GRADUATED" | "INACTIVE"
) {
  await requireRole("ADMIN");
  await prisma.student.update({ where: { id: studentId }, data: { status } });
  revalidatePath("/admin/students");
}
