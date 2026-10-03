"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { recordInvoicePayment } from "@/lib/finance";
import {
  feeStructureSchema,
  generateInvoicesSchema,
  recordPaymentSchema,
  feeItemNames,
} from "@/lib/validators/fees";
import type { ActionState } from "./types";

export async function createFeeStructure(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN");
  const parsed = feeStructureSchema.safeParse({
    classId: formData.get("classId"),
    termId: formData.get("termId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const existing = await prisma.feeStructure.findUnique({
    where: { classId_termId: parsed.data },
  });
  if (existing) return { error: "A fee structure already exists for this course and semester" };

  const items = feeItemNames
    .map((name) => ({ name, amount: Number(formData.get(`amount_${name}`) ?? 0) }))
    .filter((item) => item.amount > 0);

  if (items.length === 0) return { error: "Add at least one fee item with an amount" };

  await prisma.feeStructure.create({
    data: {
      classId: parsed.data.classId,
      termId: parsed.data.termId,
      items: { create: items },
    },
  });

  revalidatePath("/admin/fees");
  return { success: "Fee structure created" };
}

export async function generateInvoicesForClass(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("ADMIN", "ACCOUNTANT");
  const parsed = generateInvoicesSchema.safeParse({
    classId: formData.get("classId"),
    termId: formData.get("termId"),
    dueDate: formData.get("dueDate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const structure = await prisma.feeStructure.findUnique({
    where: { classId_termId: { classId: parsed.data.classId, termId: parsed.data.termId } },
    include: { items: true },
  });
  if (!structure) return { error: "No fee structure exists for this course and semester yet" };

  const students = await prisma.student.findMany({
    where: { classId: parsed.data.classId, status: "ACTIVE" },
  });
  if (students.length === 0) return { error: "No active students in this course" };

  const totalAmount = structure.items.reduce((sum, item) => sum + item.amount, 0);
  const dueDate = new Date(parsed.data.dueDate);

  let created = 0;
  for (const student of students) {
    const existing = await prisma.invoice.findUnique({
      where: { studentId_termId: { studentId: student.id, termId: parsed.data.termId } },
    });
    if (existing) continue;

    await prisma.invoice.create({
      data: {
        studentId: student.id,
        termId: parsed.data.termId,
        totalAmount,
        dueDate,
        items: {
          create: structure.items.map((item) => ({ name: item.name, amount: item.amount })),
        },
      },
    });
    created += 1;
  }

  revalidatePath("/accountant/invoices");
  return { success: `Generated ${created} new invoice(s) (${students.length - created} already existed)` };
}

export async function recordPayment(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("ADMIN", "ACCOUNTANT");
  const parsed = recordPaymentSchema.safeParse({
    invoiceId: formData.get("invoiceId"),
    amount: formData.get("amount"),
    method: formData.get("method"),
    reference: formData.get("reference") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const invoice = await prisma.invoice.findUnique({ where: { id: parsed.data.invoiceId } });
  if (!invoice) return { error: "Invoice not found" };

  await prisma.$transaction((tx) =>
    recordInvoicePayment(tx, {
      invoiceId: invoice.id,
      amount: parsed.data.amount,
      method: parsed.data.method,
      reference: parsed.data.reference,
      recordedById: session.userId,
    })
  );

  revalidatePath("/accountant/invoices");
  revalidatePath("/accountant/payments");
  return { success: "Payment recorded" };
}
