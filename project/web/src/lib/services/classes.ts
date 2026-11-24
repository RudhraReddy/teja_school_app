import { db } from "../db";
import { notFound } from "../errors";
import type { CurrentUser } from "../auth";
import { classSchema } from "../validators";
import { assertAdmin } from "./guard";

export async function listClasses() {
  return db.schoolClass.findMany({
    include: { classTeacher: { select: { id: true, name: true } }, _count: { select: { students: true } } },
    orderBy: [{ name: "asc" }, { section: "asc" }],
  });
}

export async function getClass(id: string) {
  const cls = await db.schoolClass.findUnique({
    where: { id },
    include: {
      classTeacher: { select: { id: true, name: true, email: true, phone: true } },
      students: { orderBy: [{ firstName: "asc" }, { lastName: "asc" }] },
    },
  });
  if (!cls) throw notFound("Class");
  return cls;
}

export async function createClass(me: CurrentUser, input: unknown) {
  assertAdmin(me);
  return db.schoolClass.create({ data: classSchema.parse(input) });
}

export async function updateClass(me: CurrentUser, id: string, input: unknown) {
  assertAdmin(me);
  return db.schoolClass.update({ where: { id }, data: classSchema.parse(input) });
}

export async function deleteClass(me: CurrentUser, id: string) {
  assertAdmin(me);
  await db.schoolClass.delete({ where: { id } });
}

export const classLabel = (c: { name: string; section: string }) => `${c.name} – ${c.section}`;
