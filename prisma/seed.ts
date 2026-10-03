import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const school = await prisma.school.upsert({
    where: { id: "masinga-tvc" },
    update: {},
    create: {
      id: "masinga-tvc",
      name: "Masinga Technical Vocational College",
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
      name: "College Administrator",
    },
  });

  const academicYear = await prisma.academicYear.upsert({
    where: { name: "2026/2027" },
    update: {},
    create: {
      name: "2026/2027",
      startDate: new Date("2026-09-07"),
      endDate: new Date("2027-07-30"),
      isCurrent: true,
    },
  });

  await prisma.term.upsert({
    where: { academicYearId_name: { academicYearId: academicYear.id, name: "Semester 1" } },
    update: {},
    create: {
      name: "Semester 1",
      startDate: new Date("2026-09-07"),
      endDate: new Date("2026-12-18"),
      isCurrent: true,
      academicYearId: academicYear.id,
    },
  });

  console.log("Seeded college:", school.name);
  console.log("Seeded admin login: ", adminEmail, "/ Admin@123");
  console.log("Seeded academic year:", academicYear.name, "with Semester 1");
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
