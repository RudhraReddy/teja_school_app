/**
 * Creates the first admin account (from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD).
 * Run with `--demo` to also add sample classes, teachers, students, fees and notices.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const demo = process.argv.includes("--demo");

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@tejaschool.in").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const admin = await db.user.upsert({
    where: { email },
    update: {},
    create: { name: "School Admin", email, role: "ADMIN", passwordHash: await bcrypt.hash(password, 10) },
  });
  console.log(`Admin account: ${email}`);

  if (!demo) return;
  if (await db.student.count()) {
    console.log("Students already exist — skipping demo data.");
    return;
  }

  const pw = await bcrypt.hash("Teacher123!", 10);
  const teacherNames = ["Lakshmi Rao", "Arjun Mehta", "Fatima Shaikh", "David Joseph"];
  const teachers = await Promise.all(
    teacherNames.map((name) =>
      db.user.create({ data: { name, email: `${name.split(" ")[0].toLowerCase()}@tejaschool.in`, role: "TEACHER", passwordHash: pw } }),
    ),
  );

  const classes = await Promise.all(
    ["Grade 6", "Grade 7", "Grade 8", "Grade 9"].map((name, i) =>
      db.schoolClass.create({ data: { name, section: "A", room: String(101 + i), classTeacherId: teachers[i].id } }),
    ),
  );

  const first = ["Aarav", "Ananya", "Vihaan", "Diya", "Ishaan", "Saanvi", "Reyansh", "Myra", "Kabir", "Aditi", "Rohan", "Kavya"];
  const last = ["Reddy", "Sharma", "Naidu", "Patel", "Khan", "Iyer", "Gupta", "Das"];
  let n = 1;
  for (const cls of classes) {
    for (let i = 0; i < 8; i++) {
      const fn = first[(n * 7) % first.length];
      const ln = last[(n * 3) % last.length];
      await db.student.create({
        data: {
          admissionNo: `TIS${String(2026000 + n)}`,
          firstName: fn,
          lastName: ln,
          gender: n % 2 ? "MALE" : "FEMALE",
          guardianName: `Mr./Mrs. ${ln}`,
          guardianPhones: [`98${String(48000000 + n * 1373).slice(0, 8)}`],
          classId: cls.id,
        },
      });
      n++;
    }
  }

  // Fees belong to each student. Every student gets the two tuition fees; Grade 9 also gets a lab fee.
  const all = await db.student.findMany({ include: { class: true } });
  for (const s of all) {
    await db.feeItem.create({ data: { studentId: s.id, name: "Term 1 Tuition", amount: 18000, dueDate: new Date("2026-07-15") } });
    await db.feeItem.create({ data: { studentId: s.id, name: "Term 2 Tuition", amount: 18000, dueDate: new Date("2026-12-15") } });
    if (s.class?.name === "Grade 9") {
      await db.feeItem.create({ data: { studentId: s.id, name: "Lab Fee", amount: 2500, dueDate: new Date("2026-08-01") } });
    }
  }

  const students = await db.student.findMany({ take: 20 });
  for (const [i, s] of students.entries()) {
    const term1 = await db.feeItem.findFirstOrThrow({ where: { studentId: s.id, name: "Term 1 Tuition" } });
    await db.feePayment.create({
      data: {
        studentId: s.id,
        feeItemId: term1.id,
        amount: i % 4 === 0 ? 9000 : 18000,
        method: i % 3 === 0 ? "UPI" : "CASH",
        receiptNo: `TIS-DEMO-${String(i + 1).padStart(4, "0")}`,
        recordedById: admin.id,
      },
    });
  }

  await db.notice.createMany({
    data: [
      { title: "Welcome to the new school portal", body: "All staff can now view student records, notices and fee status here and in the mobile app.", pinned: true, authorId: admin.id },
      { title: "Annual Day rehearsals", body: "Rehearsals begin Monday after the last period in the auditorium. Class teachers please share the list of participants by Friday.", authorId: teachers[0].id },
      { title: "Staff meeting on Saturday", body: "There will be a staff meeting at 10:00 AM in the conference room to discuss mid-term exams.", audience: "TEACHERS", authorId: admin.id },
    ],
  });
  console.log("Demo data added. Teacher logins: lakshmi@, arjun@, fatima@, david@tejaschool.in / Teacher123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
