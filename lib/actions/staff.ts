"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { createStaffSchema } from "@/lib/validators/staff";
import type { ActionState } from "./types";

export async function createStaff(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");

  const parsed = createStaffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    role: formData.get("role"),
    staffNo: formData.get("staffNo"),
    position: formData.get("position"),
    department: formData.get("department") || undefined,
    hireDate: formData.get("hireDate"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const existingEmail = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existingEmail) return { error: "A user with this email already exists" };

  const existingStaffNo = await prisma.staffProfile.findUnique({
    where: { staffNo: parsed.data.staffNo },
  });
  if (existingStaffNo) return { error: "A staff member with this staff number already exists" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      role: parsed.data.role,
      passwordHash,
      staffProfile: {
        create: {
          staffNo: parsed.data.staffNo,
          position: parsed.data.position,
          department: parsed.data.department,
          hireDate: new Date(parsed.data.hireDate),
        },
      },
    },
  });

  revalidatePath("/admin/staff");
  return { success: "Staff member created" };
}

export async function toggleStaffActive(userId: string, active: boolean) {
  await requireRole("ADMIN");
  await prisma.user.update({ where: { id: userId }, data: { active } });
  revalidatePath("/admin/staff");
}
