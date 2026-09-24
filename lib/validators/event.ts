import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  audience: z.enum(["ALL", "TEACHERS", "PARENTS", "CLASS"]),
  classId: z.string().optional(),
});
