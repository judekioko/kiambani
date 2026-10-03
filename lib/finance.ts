import { prisma } from "@/lib/prisma";
import { generateReceiptNo } from "@/lib/receipt";
import type { Prisma, PaymentMethod } from "./generated/prisma/client";

export async function recordInvoicePayment(
  tx: Prisma.TransactionClient,
  input: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string | null;
    recordedById: string;
    paidAt?: Date;
  }
) {
  const payment = await tx.payment.create({
    data: {
      invoiceId: input.invoiceId,
      amount: input.amount,
      method: input.method,
      reference: input.reference ?? null,
      recordedById: input.recordedById,
      ...(input.paidAt ? { paidAt: input.paidAt } : {}),
    },
  });

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await tx.receipt.create({
        data: {
          paymentId: payment.id,
          receiptNo: generateReceiptNo(),
          ...(input.paidAt ? { issuedAt: input.paidAt } : {}),
        },
      });
      break;
    } catch {
      if (attempt === 2) throw new Error("Could not generate a unique receipt number");
    }
  }

  const invoice = await tx.invoice.findUniqueOrThrow({ where: { id: input.invoiceId } });
  const { _sum } = await tx.payment.aggregate({
    where: { invoiceId: input.invoiceId },
    _sum: { amount: true },
  });
  const totalPaid = _sum.amount ?? 0;
  const status = totalPaid >= invoice.totalAmount ? "PAID" : totalPaid > 0 ? "PARTIAL" : "UNPAID";
  await tx.invoice.update({ where: { id: input.invoiceId }, data: { status } });

  return payment;
}

export type StatementRow = {
  date: Date;
  kind: "INVOICE" | "PAYMENT";
  description: string;
  debit: number;
  credit: number;
  balance: number;
  receiptId?: string;
  receiptNo?: string;
};

const round2 = (n: number) => Math.round(n * 100) / 100;

export async function getStudentFinance(studentId: string) {
  const invoices = await prisma.invoice.findMany({
    where: { studentId },
    include: {
      term: { include: { academicYear: true } },
      payments: { include: { receipt: true }, orderBy: { paidAt: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  const events: Omit<StatementRow, "balance">[] = [];
  for (const inv of invoices) {
    events.push({
      date: inv.createdAt,
      kind: "INVOICE",
      description: `Fees invoice - ${inv.term.academicYear.name} ${inv.term.name}`,
      debit: inv.totalAmount,
      credit: 0,
    });
    for (const p of inv.payments) {
      events.push({
        date: p.paidAt,
        kind: "PAYMENT",
        description: `Payment (${p.method}${p.reference ? ` - ${p.reference}` : ""}) - ${inv.term.academicYear.name} ${inv.term.name}`,
        debit: 0,
        credit: p.amount,
        receiptId: p.receipt?.id,
        receiptNo: p.receipt?.receiptNo,
      });
    }
  }
  events.sort(
    (a, b) => a.date.getTime() - b.date.getTime() || (a.kind === "INVOICE" ? -1 : 1)
  );

  let running = 0;
  const statement: StatementRow[] = events.map((e) => {
    running = round2(running + e.debit - e.credit);
    return { ...e, balance: running };
  });

  const totalBilled = round2(invoices.reduce((s, i) => s + i.totalAmount, 0));
  const totalPaid = round2(
    invoices.reduce((s, i) => s + i.payments.reduce((x, p) => x + p.amount, 0), 0)
  );
  const balance = round2(totalBilled - totalPaid);
  const currentInvoice = invoices.find((i) => i.term.isCurrent) ?? null;

  return {
    invoices: invoices.map((i) => {
      const paid = i.payments.reduce((s, p) => s + p.amount, 0);
      return { ...i, paid: round2(paid), balance: round2(i.totalAmount - paid) };
    }),
    statement,
    totalBilled,
    totalPaid,
    balance,
    currentInvoice,
    cleared: currentInvoice !== null && balance <= 0,
  };
}
