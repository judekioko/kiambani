import { z } from "zod";

export const createStudentSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  admissionNo: z.string().trim().min(1, "Admission number is required"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE"]),
  classId: z.string().optional(),
  guardianName: z.string().trim().min(1, "Guardian name is required"),
  guardianEmail: z.string().trim().toLowerCase().email("Enter a valid guardian email"),
  guardianPhone: z.string().trim().optional(),
  guardianRelationship: z.string().trim().min(1, "Relationship is required"),
});
