import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import type { ReceiptData } from "@/components/receipt-view";

export function generateReceiptNo(): string {
  const year = new Date().getFullYear();
  const rand = randomBytes(5).toString("hex").toUpperCase();
  return `MTVC-${year}-${rand}`;
}

export type PublicReceiptInfo = {
  receiptNo: string;
  issuedAt: Date;
  amount: number;
  method: string;
  studentName: string;
  className: string;
};

export async function getPublicReceiptByNo(receiptNo: string): Promise<PublicReceiptInfo | null> {
  const receipt = await prisma.receipt.findUnique({
    where: { receiptNo },
    include: {
      payment: {
        include: { invoice: { include: { student: { include: { class: true } } } } },
      },
    },
  });
  if (!receipt) return null;

  const student = receipt.payment.invoice.student;
  return {
    receiptNo: receipt.receiptNo,
    issuedAt: receipt.issuedAt,
    amount: receipt.payment.amount,
    method: receipt.payment.method,
    studentName: `${student.firstName} ${student.lastName}`,
    className: student.class?.name ?? "Unassigned",
  };
}

export async function getReceiptById(receiptId: string): Promise<{
  data: ReceiptData;
  studentId: string;
} | null> {
  const receipt = await prisma.receipt.findUnique({
    where: { id: receiptId },
    include: {
      payment: {
        include: {
          invoice: {
            include: { student: { include: { class: true } }, term: true, payments: true },
          },
        },
      },
    },
  });
  if (!receipt) return null;

  const { payment } = receipt;
  const { invoice } = payment;
  const totalPaidSoFar = invoice.payments.reduce((sum, p) => sum + p.amount, 0);

  return {
    studentId: invoice.studentId,
    data: {
      receiptNo: receipt.receiptNo,
      issuedAt: receipt.issuedAt,
      studentName: `${invoice.student.firstName} ${invoice.student.lastName}`,
      admissionNo: invoice.student.admissionNo,
      className: invoice.student.class?.name ?? "Unassigned",
      termName: invoice.term.name,
      amount: payment.amount,
      method: payment.method,
      reference: payment.reference,
      totalAmount: invoice.totalAmount,
      totalPaidSoFar,
    },
  };
}
