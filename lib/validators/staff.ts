import { z } from "zod";

export const createStaffSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  phone: z.string().trim().optional(),
  role: z.enum(["TEACHER", "ACCOUNTANT"]),
  staffNo: z.string().trim().min(1, "Staff number is required"),
  position: z.string().trim().min(1, "Position is required"),
  department: z.string().trim().optional(),
  hireDate: z.string().min(1, "Hire date is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
