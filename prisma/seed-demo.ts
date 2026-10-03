import "dotenv/config";
import { randomBytes } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient, type FeeItemName } from "../lib/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "Demo@1234";
const d = (iso: string) => new Date(`${iso}T09:00:00+03:00`);

function receiptNo(year: number) {
  return `MTVC-${year}-${randomBytes(5).toString("hex").toUpperCase()}`;
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type FeeLine = { name: FeeItemName; amount: number };
const ICT_FEES: FeeLine[] = [
  { name: "TUITION", amount: 28000 },
  { name: "BOARDING", amount: 8500 },
  { name: "ACTIVITY", amount: 1500 },
  { name: "OTHER", amount: 3000 },
];
const ELE_FEES: FeeLine[] = [
  { name: "TUITION", amount: 24000 },
  { name: "BOARDING", amount: 8500 },
  { name: "ACTIVITY", amount: 1500 },
  { name: "UNIFORM", amount: 2500 },
  { name: "OTHER", amount: 3000 },
];
const sum = (lines: FeeLine[]) => lines.reduce((s, l) => s + l.amount, 0);

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --- College ---
  const college = await prisma.school.findFirst();
  if (college) {
    await prisma.school.update({
      where: { id: college.id },
      data: { name: "Masinga Technical Vocational College" },
    });
  } else {
    await prisma.school.create({ data: { name: "Masinga Technical Vocational College" } });
  }

  const adminUser = await prisma.user.findFirstOrThrow({ where: { role: "ADMIN" } });
  const admin = await prisma.user.update({
    where: { id: adminUser.id },
    data: { name: "College Administrator" },
  });

  // --- Academic years and semesters ---
  const legacy = await prisma.academicYear.findUnique({ where: { name: "2026" } });
  if (legacy && !(await prisma.academicYear.findUnique({ where: { name: "2025/2026" } }))) {
    await prisma.academicYear.update({ where: { id: legacy.id }, data: { name: "2025/2026" } });
  }
  const pastYear = await prisma.academicYear.upsert({
    where: { name: "2025/2026" },
    update: { startDate: d("2025-09-08"), endDate: d("2026-07-31"), isCurrent: false },
    create: { name: "2025/2026", startDate: d("2025-09-08"), endDate: d("2026-07-31") },
  });
  const currentYear = await prisma.academicYear.upsert({
    where: { name: "2026/2027" },
    update: { startDate: d("2026-09-07"), endDate: d("2027-07-30"), isCurrent: true },
    create: {
      name: "2026/2027",
      startDate: d("2026-09-07"),
      endDate: d("2027-07-30"),
      isCurrent: true,
    },
  });
  await prisma.academicYear.updateMany({
    where: { id: { not: currentYear.id } },
    data: { isCurrent: false },
  });

  async function term(yearId: string, name: string, start: string, end: string, current = false) {
    return prisma.term.upsert({
      where: { academicYearId_name: { academicYearId: yearId, name } },
      update: { startDate: d(start), endDate: d(end), isCurrent: current },
      create: {
        academicYearId: yearId,
        name,
        startDate: d(start),
        endDate: d(end),
        isCurrent: current,
      },
    });
  }
  const y1s1 = await term(pastYear.id, "Semester 1", "2025-09-08", "2025-12-12");
  const y1s2 = await term(pastYear.id, "Semester 2", "2026-01-12", "2026-04-24");
  const cur = await term(currentYear.id, "Semester 1", "2026-09-07", "2026-12-18", true);
  await term(currentYear.id, "Semester 2", "2027-01-11", "2027-04-23");
  await prisma.term.updateMany({ where: { id: { not: cur.id } }, data: { isCurrent: false } });

  // --- Grading scale ---
  const scale = await prisma.gradingScale.upsert({
    where: { name: "Standard TVET Scale" },
    update: {},
    create: { name: "Standard TVET Scale" },
  });
  if ((await prisma.gradeBand.count({ where: { gradingScaleId: scale.id } })) === 0) {
    await prisma.gradeBand.createMany({
      data: [
        { minPercent: 70, maxPercent: 100, letter: "A", comment: "Distinction" },
        { minPercent: 60, maxPercent: 69.99, letter: "B", comment: "Credit" },
        { minPercent: 50, maxPercent: 59.99, letter: "C", comment: "Pass" },
        { minPercent: 40, maxPercent: 49.99, letter: "D", comment: "Referral" },
        { minPercent: 0, maxPercent: 39.99, letter: "E", comment: "Fail" },
      ].map((b) => ({ ...b, gradingScaleId: scale.id })),
    });
  }

  // --- Staff ---
  async function staff(
    name: string,
    email: string,
    role: "TEACHER" | "ACCOUNTANT",
    staffNo: string,
    position: string,
    department: string
  ) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        name,
        email,
        role,
        passwordHash,
        phone: "+254700000000",
        staffProfile: {
          create: { staffNo, position, department, hireDate: d("2022-01-10") },
        },
      },
    });
    return user;
  }
  const grace = await staff("Grace Mwangi", "grace.mwangi@example.com", "TEACHER", "T-001", "Trainer", "ICT");
  const daniel = await staff("Daniel Ochieng", "daniel.ochieng@example.com", "TEACHER", "T-002", "Trainer", "Electrical Engineering");
  const mary = await staff("Mary Wambui", "mary.wambui@example.com", "TEACHER", "T-003", "Trainer", "Business and General Studies");
  const peter = await staff("Peter Kamau", "peter.kamau@example.com", "ACCOUNTANT", "A-001", "Finance Officer", "Finance");

  // --- Units ---
  async function unit(code: string, name: string) {
    return prisma.subject.upsert({ where: { code }, update: { name }, create: { code, name } });
  }
  const U = {
    ict101: await unit("ICT 101", "Introduction to Computer Systems"),
    ict102: await unit("ICT 102", "Computer Applications"),
    ict103: await unit("ICT 103", "Programming Fundamentals"),
    com101: await unit("COM 101", "Communication Skills"),
    ict104: await unit("ICT 104", "Mathematics for ICT"),
    ict105: await unit("ICT 105", "Computer Hardware and Maintenance"),
    ict106: await unit("ICT 106", "Database Fundamentals"),
    ent101: await unit("ENT 101", "Entrepreneurship Skills"),
    ict201: await unit("ICT 201", "Computer Networking"),
    ict202: await unit("ICT 202", "Database Systems"),
    ict203: await unit("ICT 203", "Web Development"),
    ict204: await unit("ICT 204", "Systems Analysis and Design"),
    ict205: await unit("ICT 205", "Object-Oriented Programming"),
    com201: await unit("COM 201", "Professional Communication"),
    ele101: await unit("ELE 101", "Electrical Principles"),
    ele102: await unit("ELE 102", "Wiring and Installation"),
    ele103: await unit("ELE 103", "Electrical Safety"),
    mat101: await unit("MAT 101", "Technical Mathematics"),
  };

  // --- Courses ---
  async function course(name: string, yearId: string, coordinatorId: string) {
    return prisma.schoolClass.upsert({
      where: { academicYearId_name: { academicYearId: yearId, name } },
      update: { classTeacherId: coordinatorId },
      create: { name, academicYearId: yearId, classTeacherId: coordinatorId },
    });
  }
  const ictY1 = await course("Diploma in Information Communication Technology - Year 1", pastYear.id, grace.id);
  const ictY2 = await course("Diploma in Information Communication Technology - Year 2", currentYear.id, grace.id);
  const eleY1 = await course("Certificate in Electrical Installation - Year 1", currentYear.id, daniel.id);

  // --- Units offered per course and semester ---
  async function offer(classId: string, termId: string, rows: [{ id: string }, { id: string }][]) {
    for (const [subject, trainer] of rows) {
      await prisma.classSubjectTeacher.upsert({
        where: { classId_subjectId_termId: { classId, subjectId: subject.id, termId } },
        update: { teacherId: trainer.id },
        create: { classId, subjectId: subject.id, teacherId: trainer.id, termId },
      });
    }
  }
  await offer(ictY1.id, y1s1.id, [[U.ict101, grace], [U.ict102, grace], [U.ict103, grace], [U.com101, mary]]);
  await offer(ictY1.id, y1s2.id, [[U.ict104, mary], [U.ict105, daniel], [U.ict106, grace], [U.ent101, mary]]);
  await offer(ictY2.id, cur.id, [
    [U.ict201, grace], [U.ict202, grace], [U.ict203, grace],
    [U.ict204, mary], [U.ict205, grace], [U.com201, mary],
  ]);
  await offer(eleY1.id, cur.id, [
    [U.ele101, daniel], [U.ele102, daniel], [U.ele103, daniel], [U.mat101, mary], [U.com101, mary],
  ]);

  // --- Fee structures ---
  async function feeStructure(classId: string, termId: string, lines: FeeLine[]) {
    const existing = await prisma.feeStructure.findUnique({
      where: { classId_termId: { classId, termId } },
    });
    if (existing) return existing;
    return prisma.feeStructure.create({
      data: { classId, termId, items: { create: lines } },
    });
  }
  await feeStructure(ictY1.id, y1s1.id, ICT_FEES);
  await feeStructure(ictY1.id, y1s2.id, ICT_FEES);
  await feeStructure(ictY2.id, cur.id, ICT_FEES);
  await feeStructure(eleY1.id, cur.id, ELE_FEES);

  // --- Students ---
  async function student(
    admissionNo: string,
    first: string,
    last: string,
    gender: "MALE" | "FEMALE",
    dob: string,
    classId: string,
    email: string,
    phone: string,
    hostel?: [string, string]
  ) {
    const existing = await prisma.student.findUnique({ where: { admissionNo } });
    if (existing) return existing;
    return prisma.student.create({
      data: {
        admissionNo,
        firstName: first,
        lastName: last,
        gender,
        dob: d(dob),
        class: { connect: { id: classId } },
        enrollmentDate: d(admissionNo.includes("/2026/") ? "2026-09-07" : "2025-09-08"),
        hostelName: hostel?.[0] ?? null,
        hostelRoom: hostel?.[1] ?? null,
        user: {
          create: { name: `${first} ${last}`, email, phone, role: "STUDENT", passwordHash },
        },
      },
    });
  }

  const wanjiku = await student("MTVC/2025/001", "Wanjiku", "Kamau", "FEMALE", "2004-03-14", ictY2.id, "wanjiku.kamau@example.com", "+254722000001", ["Ndolo Hostel", "204"]);
  const faith = await student("MTVC/2025/002", "Faith", "Achieng", "FEMALE", "2003-11-02", ictY2.id, "faith.achieng@example.com", "+254722000002", ["Ndolo Hostel", "117"]);
  const brian = await student("MTVC/2025/003", "Brian", "Mutua", "MALE", "2003-07-21", ictY2.id, "brian.mutua@example.com", "+254722000003");
  const kevin = await student("MTVC/2025/004", "Kevin", "Otieno", "MALE", "2004-01-30", ictY2.id, "kevin.otieno@example.com", "+254722000004", ["Kyanguli Hostel", "310"]);
  const samuel = await student("MTVC/2025/008", "Samuel", "Kiptoo", "MALE", "2003-09-09", ictY2.id, "samuel.kiptoo@example.com", "+254722000008");
  const esther = await student("MTVC/2026/005", "Esther", "Njeri", "FEMALE", "2005-05-18", eleY1.id, "esther.njeri@example.com", "+254722000005", ["Ndolo Hostel", "121"]);
  const hassan = await student("MTVC/2026/006", "Hassan", "Abdi", "MALE", "2005-02-11", eleY1.id, "hassan.abdi@example.com", "+254722000006");
  const mercy = await student("MTVC/2026/007", "Mercy", "Wairimu", "FEMALE", "2005-08-25", eleY1.id, "mercy.wairimu@example.com", "+254722000007");

  // --- Invoices and payments ---
  async function bill(
    studentId: string,
    termId: string,
    lines: FeeLine[],
    billedOn: string,
    payments: { amount: number; on: string; ref: string }[]
  ) {
    const total = sum(lines);
    const invoice = await prisma.invoice.upsert({
      where: { studentId_termId: { studentId, termId } },
      update: {},
      create: {
        studentId,
        termId,
        totalAmount: total,
        dueDate: d(billedOn),
        createdAt: d(billedOn),
        items: { create: lines },
      },
    });
    if ((await prisma.payment.count({ where: { invoiceId: invoice.id } })) > 0) return invoice;

    let paid = 0;
    for (const p of payments) {
      const payment = await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: p.amount,
          method: "BANK",
          reference: p.ref,
          paidAt: d(p.on),
          recordedById: peter.id,
        },
      });
      await prisma.receipt.create({
        data: {
          paymentId: payment.id,
          receiptNo: receiptNo(Number(p.on.slice(0, 4))),
          issuedAt: d(p.on),
        },
      });
      paid += p.amount;
    }
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: paid >= total ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID" },
    });
    return invoice;
  }

  // Past semesters (all ICT cohort), then the current one
  const ictCohort = [wanjiku, faith, brian, kevin, samuel];
  for (const [i, s] of ictCohort.entries()) {
    const ref = (n: number) => `BNK${String(1000 + i * 10 + n)}`;
    await bill(s.id, y1s1.id, ICT_FEES, "2025-08-25", [{ amount: 41000, on: "2025-09-02", ref: ref(1) }]);
    // Brian still owes part of Semester 2 of Year 1 (arrears)
    const y1s2Paid = s.id === brian.id ? 35000 : 41000;
    await bill(s.id, y1s2.id, ICT_FEES, "2026-01-05", [{ amount: y1s2Paid, on: "2026-01-09", ref: ref(2) }]);
  }

  await bill(wanjiku.id, cur.id, ICT_FEES, "2026-08-28", [
    { amount: 30000, on: "2026-09-02", ref: "BNK2001" },
    { amount: 12500, on: "2026-09-18", ref: "BNK2002" },
  ]);
  await bill(faith.id, cur.id, ICT_FEES, "2026-08-28", [{ amount: 41000, on: "2026-09-03", ref: "BNK2003" }]);
  await bill(brian.id, cur.id, ICT_FEES, "2026-08-28", [{ amount: 20000, on: "2026-09-04", ref: "BNK2004" }]);
  await bill(kevin.id, cur.id, ICT_FEES, "2026-08-28", [{ amount: 41000, on: "2026-09-02", ref: "BNK2005" }]);
  await bill(samuel.id, cur.id, ICT_FEES, "2026-08-28", [{ amount: 41000, on: "2026-09-05", ref: "BNK2006" }]);
  const estherInvoice = await bill(esther.id, cur.id, ELE_FEES, "2026-08-28", [{ amount: 20000, on: "2026-09-04", ref: "BNK2007" }]);
  await bill(hassan.id, cur.id, ELE_FEES, "2026-08-28", [{ amount: 39500, on: "2026-09-03", ref: "BNK2008" }]);
  await bill(mercy.id, cur.id, ELE_FEES, "2026-08-28", []);

  // A bank payment waiting for the accountant to confirm
  if (!(await prisma.paymentClaim.findFirst({ where: { bankReference: "SLIP-4471920" } }))) {
    await prisma.paymentClaim.create({
      data: {
        studentId: esther.id,
        invoiceId: estherInvoice.id,
        amount: 19500,
        bankReference: "SLIP-4471920",
        depositDate: d("2026-10-02"),
        note: "Balance for Semester 1",
      },
    });
  }

  // --- Assessments and results for the two past semesters ---
  async function assess(
    classId: string,
    termId: string,
    subjectId: string,
    date: string,
    name: string,
    maxScore: number,
    type: "CAT" | "EXAM"
  ) {
    const found = await prisma.assessment.findFirst({ where: { classId, termId, subjectId, name } });
    return (
      found ??
      prisma.assessment.create({
        data: { classId, termId, subjectId, name, maxScore, type, date: d(date) },
      })
    );
  }
  const pastPlan = [
    { term: y1s1, date: ["2025-10-24", "2025-12-05"], units: [U.ict101, U.ict102, U.ict103, U.com101] },
    { term: y1s2, date: ["2026-03-06", "2026-04-17"], units: [U.ict104, U.ict105, U.ict106, U.ent101] },
  ];
  for (const plan of pastPlan) {
    for (const [ui, subject] of plan.units.entries()) {
      const cat = await assess(ictY1.id, plan.term.id, subject.id, plan.date[0], "CAT 1", 30, "CAT");
      const exam = await assess(ictY1.id, plan.term.id, subject.id, plan.date[1], "End of Semester Exam", 70, "EXAM");
      for (const [si, s] of ictCohort.entries()) {
        const rand = rng(si * 977 + ui * 131 + plan.term.name.length * 17 + (plan.term.id === y1s2.id ? 5 : 1));
        const base = 0.52 + rand() * 0.38;
        const catScore = Math.round(30 * Math.min(1, base + (rand() - 0.5) * 0.12) * 2) / 2;
        const examScore = Math.round(70 * Math.min(1, base + (rand() - 0.5) * 0.16));
        for (const [a, score] of [[cat, catScore], [exam, examScore]] as const) {
          await prisma.mark.upsert({
            where: { assessmentId_studentId: { assessmentId: a.id, studentId: s.id } },
            update: {},
            create: { assessmentId: a.id, studentId: s.id, score },
          });
        }
      }
    }
  }

  // --- Unit registration for the current semester (Faith, Brian, Esther, Mercy left unregistered) ---
  const ictUnits = [U.ict201, U.ict202, U.ict203, U.ict204, U.ict205, U.com201];
  for (const s of [wanjiku, kevin, samuel]) {
    await prisma.unitRegistration.createMany({
      data: ictUnits.map((u) => ({ studentId: s.id, subjectId: u.id, termId: cur.id })),
      skipDuplicates: true,
    });
  }
  await prisma.unitRegistration.createMany({
    data: [U.ele101, U.ele102, U.ele103, U.mat101, U.com101].map((u) => ({
      studentId: hassan.id,
      subjectId: u.id,
      termId: cur.id,
    })),
    skipDuplicates: true,
  });

  // --- Attendance this semester (ICT Year 2) ---
  const days = ["2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17", "2026-09-18", "2026-09-21", "2026-09-22", "2026-09-23"];
  for (const [si, s] of ictCohort.entries()) {
    for (const [di, day] of days.entries()) {
      const r = rng(si * 31 + di * 7 + 3)();
      const status = r < 0.07 ? "ABSENT" : r < 0.14 ? "LATE" : "PRESENT";
      await prisma.attendanceRecord.upsert({
        where: { studentId_date: { studentId: s.id, date: d(day) } },
        update: {},
        create: {
          studentId: s.id,
          classId: ictY2.id,
          termId: cur.id,
          date: d(day),
          status,
          markedById: grace.id,
        },
      });
    }
  }

  // --- Announcements and events ---
  async function announce(title: string, body: string, audience: "ALL" | "CLASS", classId?: string) {
    if (await prisma.announcement.findFirst({ where: { title } })) return;
    await prisma.announcement.create({
      data: { title, body, audience, classId: classId ?? null, authorId: admin.id },
    });
  }
  await announce(
    "Fee clearance and unit registration",
    "Unit registration for Semester 1 2026/2027 is open. You must clear your fee balance before you can register for units and print your exam card. Pay at the bank and submit your slip reference under Pay Fees.",
    "ALL"
  );
  await announce(
    "End of semester examinations",
    "End of semester examinations begin on 1 December 2026. Print your exam card from the portal once your fees are cleared and your units registered.",
    "ALL"
  );
  await announce(
    "Industrial attachment briefing - Diploma ICT Year 2",
    "All Diploma in ICT Year 2 students must attend the industrial attachment briefing. Bring your logbook.",
    "CLASS",
    ictY2.id
  );

  async function event(title: string, description: string, start: string, end: string | null, classId?: string) {
    if (await prisma.schoolEvent.findFirst({ where: { title } })) return;
    await prisma.schoolEvent.create({
      data: {
        title,
        description,
        startDate: d(start),
        endDate: end ? d(end) : null,
        audience: classId ? "CLASS" : "ALL",
        classId: classId ?? null,
        authorId: admin.id,
      },
    });
  }
  await event("Industrial attachment briefing", "Briefing for Diploma ICT Year 2 students.", "2026-10-14", null, ictY2.id);
  await event("Career and Industry Day", "Meet employers and apprenticeship providers.", "2026-10-22", null);
  await event("Sports and Talent Day", "Inter-department sports and talent showcase.", "2026-11-05", null);
  await event("End of semester examinations", "Semester 1 examinations. Carry your exam card.", "2026-12-01", "2026-12-11");

  console.log("\nDemo data loaded for Masinga Technical Vocational College.\n");
  console.log(`All demo accounts below use the password: ${DEMO_PASSWORD}`);
  console.log("(the admin keeps its own password)\n");
  const rows: [string, string, string][] = [
    ["Admin", admin.email, "(existing password)"],
    ["Trainer", grace.email, "Course Coordinator, Diploma ICT"],
    ["Trainer", daniel.email, "Course Coordinator, Certificate Electrical"],
    ["Accountant", peter.email, "Confirms bank payments"],
    ["Student", "wanjiku.kamau@example.com", "Fees cleared, registered, 2 past semesters of results"],
    ["Student", "faith.achieng@example.com", "Fees cleared, NOT registered (demo registration)"],
    ["Student", "brian.mutua@example.com", "Owes fees (blocked; demo paying)"],
    ["Student", "kevin.otieno@example.com", "Cleared and registered"],
    ["Student", "esther.njeri@example.com", "Has a bank payment awaiting confirmation"],
    ["Student", "mercy.wairimu@example.com", "Owes full fees"],
  ];
  for (const [role, email, note] of rows) console.log(`${role.padEnd(11)}${email.padEnd(34)}${note}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
