import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const school = await prisma.school.upsert({
    where: { id: "kiambani-school" },
    update: {},
    create: {
      id: "kiambani-school",
      name: "Kiambani School",
    },
  });

  const adminEmail = "admin@kiambani.school";
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      name: "School Administrator",
    },
  });

  const academicYear = await prisma.academicYear.upsert({
    where: { name: "2026" },
    update: {},
    create: {
      name: "2026",
      startDate: new Date("2026-01-05"),
      endDate: new Date("2026-11-27"),
      isCurrent: true,
    },
  });

  await prisma.term.upsert({
    where: { academicYearId_name: { academicYearId: academicYear.id, name: "Term 1" } },
    update: {},
    create: {
      name: "Term 1",
      startDate: new Date("2026-01-05"),
      endDate: new Date("2026-04-03"),
      isCurrent: true,
      academicYearId: academicYear.id,
    },
  });

  console.log("Seeded school:", school.name);
  console.log("Seeded admin login: ", adminEmail, "/ Admin@123");
  console.log("Seeded academic year:", academicYear.name, "with Term 1");
  console.log("Admin user id:", admin.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
