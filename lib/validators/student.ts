import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email");
const phone = z.string().trim().min(1, "Phone number is required");

export const createStudentSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  admissionNo: z.string().trim().min(1, "Admission number is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE"]),
  classId: z.string().optional(),
  email,
  phone,
});

export const updateStudentContactSchema = z.object({
  studentId: z.string().min(1),
  email,
  phone,
});
