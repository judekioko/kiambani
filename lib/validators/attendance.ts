import { z } from "zod";

export const markAttendanceSchema = z.object({
  classId: z.string().min(1),
  termId: z.string().min(1),
  date: z.string().min(1),
});

export const attendanceStatusValues = ["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const;
