"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { recordInvoicePayment } from "@/lib/finance";
import { submitPaymentClaimSchema } from "@/lib/validators/student-portal";
import type { ActionState } from "./types";

export async function submitPaymentClaim(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole("STUDENT");

  const parsed = submitPaymentClaimSchema.safeParse({
    invoiceId: formData.get("invoiceId"),
    amount: formData.get("amount"),
    bankReference: formData.get("bankReference"),
    depositDate: formData.get("depositDate"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  const data = parsed.data;

  const student = await prisma.student.findUnique({ where: { userId: session.userId } });
  if (!student) return { error: "Your account is not linked to a student record" };

  const invoice = await prisma.invoice.findFirst({
    where: { id: data.invoiceId, studentId: student.id },
  });
  if (!invoice) return { error: "That invoice does not belong to you" };

  const duplicate = await prisma.paymentClaim.findFirst({
    where: {
      bankReference: { equals: data.bankReference, mode: "insensitive" },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });
  if (duplicate) return { error: "This bank reference has already been submitted" };

  await prisma.paymentClaim.create({
    data: {
      studentId: student.id,
      invoiceId: invoice.id,
      amount: data.amount,
      bankReference: data.bankReference,
      depositDate: new Date(data.depositDate),
      note: data.note,
    },
  });

  revalidatePath("/student/pay");
  revalidatePath("/accountant/payment-confirmations");
  revalidatePath("/accountant");
  return { success: "Payment submitted. The finance office will confirm it against the bank statement." };
}

export async function confirmPaymentClaim(formData: FormData) {
  const session = await requireRole("ACCOUNTANT", "ADMIN");
  const claimId = String(formData.get("claimId") ?? "");

  await prisma.$transaction(async (tx) => {
    const claimed = await tx.paymentClaim.updateMany({
      where: { id: claimId, status: "PENDING" },
      data: { status: "CONFIRMED", reviewedById: session.userId, reviewedAt: new Date() },
    });
    if (claimed.count === 0) return;

    const claim = await tx.paymentClaim.findUniqueOrThrow({ where: { id: claimId } });
    const payment = await recordInvoicePayment(tx, {
      invoiceId: claim.invoiceId,
      amount: claim.amount,
      method: "BANK",
      reference: claim.bankReference,
      recordedById: session.userId,
    });
    await tx.paymentClaim.update({ where: { id: claimId }, data: { paymentId: payment.id } });
  });

  revalidatePath("/accountant/payment-confirmations");
  revalidatePath("/accountant");
  revalidatePath("/accountant/invoices");
  revalidatePath("/student", "layout");
}

export async function rejectPaymentClaim(formData: FormData) {
  const session = await requireRole("ACCOUNTANT", "ADMIN");
  const claimId = String(formData.get("claimId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim() || "Payment could not be verified";

  await prisma.paymentClaim.updateMany({
    where: { id: claimId, status: "PENDING" },
    data: {
      status: "REJECTED",
      reviewedById: session.userId,
      reviewedAt: new Date(),
      rejectionReason: reason,
    },
  });

  revalidatePath("/accountant/payment-confirmations");
  revalidatePath("/accountant");
  revalidatePath("/student/pay");
}
