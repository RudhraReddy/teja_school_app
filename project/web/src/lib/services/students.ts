import type { Prisma } from "@prisma/client";
import { db } from "../db";
import { notFound } from "../errors";
import type { CurrentUser } from "../auth";
import { studentCreateSchema, studentSchema } from "../validators";
import { assertAdmin } from "./guard";

export interface StudentFilter {
  q?: string | null;
  classId?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "ALL" | null;
  page?: number;
  pageSize?: number;
}

export async function listStudents(filter: StudentFilter = {}) {
  const pageSize = Math.min(Math.max(filter.pageSize ?? 25, 1), 100);
  const page = Math.max(filter.page ?? 1, 1);
  const q = filter.q?.trim();
  const where: Prisma.StudentWhereInput = {
    ...(filter.classId ? { classId: filter.classId } : {}),
    ...(filter.status && filter.status !== "ALL" ? { status: filter.status } : filter.status === "ALL" ? {} : { status: "ACTIVE" }),
    ...(q
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { admissionNo: { contains: q, mode: "insensitive" } },
            { guardianName: { contains: q, mode: "insensitive" } },
            { guardianPhones: { has: q } },
          ],
        }
      : {}),
  };
  const [total, students] = await Promise.all([
    db.student.count({ where }),
    db.student.findMany({
      where,
      include: { class: { select: { id: true, name: true, section: true } } },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { students, total, page, pageSize, pages: Math.max(Math.ceil(total / pageSize), 1) };
}

export async function getStudent(id: string) {
  const student = await db.student.findUnique({
    where: { id },
    include: { class: { include: { classTeacher: { select: { id: true, name: true } } } } },
  });
  if (!student) throw notFound("Student");
  return student;
}

/** Creates the student and any fees entered on the same form, in one transaction. */
export async function createStudent(me: CurrentUser, input: unknown) {
  assertAdmin(me);
  const { fees, ...data } = studentCreateSchema.parse(input);
  return db.$transaction(async (tx) => {
    const student = await tx.student.create({ data });
    if (fees.length > 0) {
      await tx.feeItem.createMany({ data: fees.map((f) => ({ ...f, studentId: student.id })) });
    }
    return student;
  });
}

export async function updateStudent(me: CurrentUser, id: string, input: unknown) {
  assertAdmin(me);
  return db.student.update({ where: { id }, data: studentSchema.parse(input) });
}

export async function deleteStudent(me: CurrentUser, id: string) {
  assertAdmin(me);
  await db.student.delete({ where: { id } });
}
