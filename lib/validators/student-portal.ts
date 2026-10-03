import { z } from "zod";

export const submitPaymentClaimSchema = z.object({
  invoiceId: z.string().min(1, "Select the semester you are paying for"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  bankReference: z.string().trim().min(3, "Enter the bank slip or transaction reference"),
  depositDate: z.string().min(1, "Enter the date you paid"),
  note: z.string().trim().optional(),
});

export const collegeSettingsSchema = z.object({
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  bankName: z.string().trim().optional(),
  bankAccountName: z.string().trim().optional(),
  bankAccountNumber: z.string().trim().optional(),
  bankBranch: z.string().trim().optional(),
});

export const hostelSchema = z.object({
  studentId: z.string().min(1),
  hostelName: z.string().trim().optional(),
  hostelRoom: z.string().trim().optional(),
});
