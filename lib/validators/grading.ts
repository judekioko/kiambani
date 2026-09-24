import { z } from "zod";

export const gradingScaleSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export const gradeBandSchema = z.object({
  gradingScaleId: z.string().min(1),
  minPercent: z.coerce.number().min(0).max(100),
  maxPercent: z.coerce.number().min(0).max(100),
  letter: z.string().trim().min(1, "Letter grade is required"),
  comment: z.string().trim().optional(),
});

export const assessmentSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.enum(["EXAM", "CAT", "ASSIGNMENT"]),
  maxScore: z.coerce.number().positive("Max score must be positive"),
  termId: z.string().min(1),
  classId: z.string().min(1),
  subjectId: z.string().min(1),
});
