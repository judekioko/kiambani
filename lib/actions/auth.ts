"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/session";
import { loginSchema } from "@/lib/validators/auth";
import { ROLE_HOME } from "@/lib/roles";

export type LoginActionState = { error?: string };

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return { error: "Invalid email or password" };
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return { error: "Invalid email or password" };
  }

  if (user.role === "PARENT") {
    return {
      error:
        "Guardian accounts are no longer used. Students sign in with their own account — please contact the college office.",
    };
  }

  await createSession({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  redirect(ROLE_HOME[user.role]);
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
