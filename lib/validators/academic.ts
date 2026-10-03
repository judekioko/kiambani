import { z } from "zod";

export const academicYearSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export const termSchema = z.object({
  academicYearId: z.string().min(1),
  name: z.string().trim().min(1, "Name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export const subjectSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required").toUpperCase(),
});

export const schoolClassSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  academicYearId: z.string().min(1, "Academic year is required"),
  classTeacherId: z.string().optional(),
});

export const classSubjectTeacherSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1, "Unit is required"),
  teacherId: z.string().min(1, "Trainer is required"),
  termId: z.string().min(1, "Semester is required"),
});
