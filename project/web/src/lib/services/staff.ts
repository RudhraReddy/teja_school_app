import type { Prisma } from "@prisma/client";
import { db } from "../db";
import { notFound } from "../errors";
import type { CurrentUser } from "../auth";
import { leaveSchema, salaryPaymentSchema, staffSchema } from "../validators";
import { assertAdmin } from "./guard";

const DAY_MS = 86_400_000;

/** First and last day (UTC midnight) of a "YYYY-MM" month, and how many days it has (28 in a normal February). */
export function monthRange(month: string) {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 0));
  return { start, end, daysInMonth: end.getUTCDate() };
}

/** Number of days (inclusive) that a leave covers inside a month. */
function daysInside(from: Date, to: Date, start: Date, end: Date) {
  const s = Math.max(from.getTime(), start.getTime());
  const e = Math.min(to.getTime(), end.getTime());
  return e < s ? 0 : Math.round((e - s) / DAY_MS) + 1;
}

/** Age in whole years on a given day. */
export function ageOn(dateOfBirth: Date | null, on: Date = new Date()) {
  if (!dateOfBirth) return null;
  let age = on.getFullYear() - dateOfBirth.getFullYear();
  const beforeBirthday =
    on.getMonth() < dateOfBirth.getMonth() || (on.getMonth() === dateOfBirth.getMonth() && on.getDate() < dateOfBirth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

type LeaveRow = { startDate: Date; endDate: Date; isPaid: boolean };

/**
 * Salary for one month. Only unpaid leave days reduce salary.
 * Each unpaid day is worth monthlySalary / days in that month.
 */
export function payrollFor(member: { monthlySalary: number }, month: string, leaves: LeaveRow[], payments: { amount: number; forMonth: string }[]) {
  const { start, end, daysInMonth } = monthRange(month);
  const unpaidLeaveDays = leaves
    .filter((l) => !l.isPaid)
    .reduce((sum, l) => sum + daysInside(l.startDate, l.endDate, start, end), 0);
  const leaveDeduction = Math.round((member.monthlySalary * unpaidLeaveDays) / daysInMonth);
  const netSalary = Math.max(member.monthlySalary - leaveDeduction, 0);
  const paid = payments.filter((p) => p.forMonth === month).reduce((sum, p) => sum + p.amount, 0);
  return {
    month,
    daysInMonth,
    monthlySalary: member.monthlySalary,
    unpaidLeaveDays,
    leaveDays: leaves.reduce((sum, l) => sum + daysInside(l.startDate, l.endDate, start, end), 0),
    leaveDeduction,
    netSalary,
    paid,
    balance: netSalary - paid, // negative means overpaid
  };
}

/** One square per day of the month: null for no leave, "paid" or "unpaid" for leave. */
export function leaveDayGrid(month: string, leaves: LeaveRow[]) {
  const { start, daysInMonth } = monthRange(month);
  const days: { day: number; date: Date; kind: "paid" | "unpaid" | null }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), d));
    const hit = leaves.find((l) => date.getTime() >= l.startDate.getTime() && date.getTime() <= l.endDate.getTime());
    days.push({ day: d, date, kind: hit ? (hit.isPaid ? "paid" : "unpaid") : null });
  }
  // Weekday of the 1st (0 = Sunday), used to line days up in weekly columns like a contribution graph.
  return { days, firstWeekday: start.getUTCDay() };
}

export interface StaffFilter {
  q?: string | null;
  status?: "ACTIVE" | "INACTIVE" | "ALL" | null;
}

export async function listStaff(me: CurrentUser, filter: StaffFilter = {}) {
  assertAdmin(me);
  const q = filter.q?.trim();
  const where: Prisma.StaffMemberWhereInput = {
    ...(filter.status === "ALL" ? {} : { active: filter.status === "INACTIVE" ? false : true }),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { subject: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  return db.staffMember.findMany({ where, orderBy: [{ active: "desc" }, { name: "asc" }] });
}

export async function getStaff(me: CurrentUser, id: string) {
  assertAdmin(me);
  const member = await db.staffMember.findUnique({
    where: { id },
    include: {
      salaryPayments: { orderBy: { paidOn: "desc" } },
      leaves: { orderBy: { startDate: "desc" } },
    },
  });
  if (!member) throw notFound("Staff member");
  return member;
}

export async function createStaff(me: CurrentUser, input: unknown) {
  assertAdmin(me);
  return db.staffMember.create({ data: staffSchema.parse(input) });
}

export async function updateStaff(me: CurrentUser, id: string, input: unknown) {
  assertAdmin(me);
  return db.staffMember.update({ where: { id }, data: staffSchema.parse(input) });
}

export async function setStaffActive(me: CurrentUser, id: string, active: boolean) {
  assertAdmin(me);
  return db.staffMember.update({ where: { id }, data: { active } });
}

export async function recordSalaryPayment(me: CurrentUser, input: unknown) {
  assertAdmin(me);
  const { paidOn, ...rest } = salaryPaymentSchema.parse(input);
  const exists = await db.staffMember.findUnique({ where: { id: rest.staffId }, select: { id: true } });
  if (!exists) throw notFound("Staff member");
  return db.salaryPayment.create({
    data: { ...rest, ...(paidOn ? { paidOn } : {}), recordedById: me.id },
  });
}

/** Logs an approved leave. */
export async function logLeave(me: CurrentUser, input: unknown) {
  assertAdmin(me);
  const data = leaveSchema.parse(input);
  const exists = await db.staffMember.findUnique({ where: { id: data.staffId }, select: { id: true } });
  if (!exists) throw notFound("Staff member");
  const days = Math.round((data.endDate.getTime() - data.startDate.getTime()) / DAY_MS) + 1;
  return db.staffLeave.create({ data: { ...data, days } });
}

/** Removes a leave that was logged by mistake. */
export async function deleteLeave(me: CurrentUser, id: string) {
  assertAdmin(me);
  const leave = await db.staffLeave.findUnique({ where: { id }, select: { id: true } });
  if (!leave) throw notFound("Leave");
  await db.staffLeave.delete({ where: { id } });
}
