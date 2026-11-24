import { db } from "../db";
import { AppError, notFound } from "../errors";
import type { CurrentUser } from "../auth";
import { feeItemSchema, paymentSchema } from "../validators";
import { assertAdmin } from "./guard";

/** One student's fees, what they have paid, and the balance. Used by the student page and the mobile app. */
export async function studentFeeSummary(studentId: string) {
  const student = await db.student.findUnique({ where: { id: studentId }, select: { id: true } });
  if (!student) throw notFound("Student");
  const [items, payments] = await Promise.all([
    db.feeItem.findMany({ where: { studentId }, orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }] }),
    db.feePayment.findMany({
      where: { studentId },
      include: { feeItem: { select: { id: true, name: true } }, recordedBy: { select: { name: true } } },
      orderBy: { paidOn: "desc" },
    }),
  ]);
  const breakdown = items.map((item) => {
    const paid = payments.filter((p) => p.feeItemId === item.id).reduce((s, p) => s + p.amount, 0);
    return { item, paid, balance: Math.max(item.amount - paid, 0) };
  });
  const totalDue = items.reduce((s, i) => s + i.amount, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  return { breakdown, payments, totalDue, totalPaid, balance: Math.max(totalDue - totalPaid, 0) };
}

/**
 * Outstanding balance for each student, highest first.
 * By default only active students. Pass includeInactive to include students who have left.
 */
export async function feeBalances(opts: { classId?: string | null; includeInactive?: boolean } = {}) {
  const [students, feeTotals, paidTotals] = await Promise.all([
    db.student.findMany({
      where: {
        ...(opts.includeInactive ? {} : { status: "ACTIVE" }),
        ...(opts.classId ? { classId: opts.classId } : {}),
      },
      select: { id: true, admissionNo: true, firstName: true, lastName: true, classId: true, class: { select: { name: true, section: true } } },
    }),
    db.feeItem.groupBy({ by: ["studentId"], _sum: { amount: true } }),
    db.feePayment.groupBy({ by: ["studentId"], _sum: { amount: true } }),
  ]);
  const dueBy = new Map(feeTotals.map((f) => [f.studentId, f._sum.amount ?? 0]));
  const paidBy = new Map(paidTotals.map((p) => [p.studentId, p._sum.amount ?? 0]));
  return students
    .map((s) => {
      const due = dueBy.get(s.id) ?? 0;
      const paid = paidBy.get(s.id) ?? 0;
      return { student: s, due, paid, balance: Math.max(due - paid, 0) };
    })
    .sort((a, b) => b.balance - a.balance);
}

export async function listPayments(limit = 50) {
  return db.feePayment.findMany({
    include: {
      student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
      feeItem: { select: { name: true } },
    },
    orderBy: { paidOn: "desc" },
    take: Math.min(limit, 200),
  });
}

/** Adds a fee to one student. */
export async function addFeeItem(me: CurrentUser, studentId: string, input: unknown) {
  assertAdmin(me);
  const data = feeItemSchema.parse(input);
  const student = await db.student.findUnique({ where: { id: studentId }, select: { id: true } });
  if (!student) throw notFound("Student");
  return db.feeItem.create({ data: { ...data, studentId } });
}

/** Removes a fee. Payments already made stay on the student's history, with no fee attached. */
export async function deleteFeeItem(me: CurrentUser, id: string) {
  assertAdmin(me);
  const item = await db.feeItem.findUnique({ where: { id }, select: { id: true } });
  if (!item) throw notFound("Fee");
  await db.feeItem.delete({ where: { id } });
}

function receiptNo() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `TIS-${ymd}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export async function recordPayment(me: CurrentUser, input: unknown) {
  assertAdmin(me);
  const data = paymentSchema.parse(input);
  const { paidOn, ...rest } = data;
  if (rest.feeItemId) {
    const item = await db.feeItem.findUnique({ where: { id: rest.feeItemId }, select: { studentId: true } });
    if (!item || item.studentId !== rest.studentId) throw new AppError(400, "That fee does not belong to this student");
  }
  return db.feePayment.create({
    data: { ...rest, ...(paidOn ? { paidOn } : {}), receiptNo: receiptNo(), recordedById: me.id },
  });
}
