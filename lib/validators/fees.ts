import { z } from "zod";

export const feeItemNames = [
  "TUITION",
  "TRANSPORT",
  "BOARDING",
  "LUNCH",
  "ACTIVITY",
  "UNIFORM",
  "OTHER",
] as const;

export const feeStructureSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  termId: z.string().min(1, "Term is required"),
});

export const generateInvoicesSchema = z.object({
  classId: z.string().min(1),
  termId: z.string().min(1),
  dueDate: z.string().min(1, "Due date is required"),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().positive("Amount must be positive"),
  method: z.enum(["CASH", "MPESA", "BANK", "CHEQUE"]),
  reference: z.string().trim().optional(),
});
