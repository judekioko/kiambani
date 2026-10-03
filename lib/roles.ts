import type { Role } from "./generated/prisma/client";

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin",
  TEACHER: "/teacher",
  ACCOUNTANT: "/accountant",
  STUDENT: "/student",
  PARENT: "/login",
};

export const ROLE_PREFIXES: { prefix: string; role: Role }[] = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/teacher", role: "TEACHER" },
  { prefix: "/accountant", role: "ACCOUNTANT" },
  { prefix: "/student", role: "STUDENT" },
];
