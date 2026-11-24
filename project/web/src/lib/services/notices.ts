import { db } from "../db";
import { forbidden, notFound } from "../errors";
import type { CurrentUser } from "../auth";
import { noticeSchema } from "../validators";

export async function listNotices(limit = 50) {
  return db.notice.findMany({
    include: { author: { select: { id: true, name: true } } },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: Math.min(limit, 200),
  });
}

export async function createNotice(me: CurrentUser, input: unknown) {
  return db.notice.create({ data: { ...noticeSchema.parse(input), authorId: me.id } });
}

async function assertCanEdit(me: CurrentUser, id: string) {
  const notice = await db.notice.findUnique({ where: { id }, select: { authorId: true } });
  if (!notice) throw notFound("Notice");
  if (me.role !== "ADMIN" && notice.authorId !== me.id) throw forbidden();
}

export async function updateNotice(me: CurrentUser, id: string, input: unknown) {
  await assertCanEdit(me, id);
  return db.notice.update({ where: { id }, data: noticeSchema.parse(input) });
}

export async function deleteNotice(me: CurrentUser, id: string) {
  await assertCanEdit(me, id);
  await db.notice.delete({ where: { id } });
}
