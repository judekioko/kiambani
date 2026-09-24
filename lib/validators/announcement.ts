import { z } from "zod";

export const createAnnouncementSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  body: z.string().trim().min(1, "Body is required"),
  audience: z.enum(["ALL", "TEACHERS", "PARENTS", "CLASS"]),
  classId: z.string().optional(),
});
