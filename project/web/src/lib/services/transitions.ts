import type { Prisma } from "@prisma/client";
import { db } from "../db";
import type { CurrentUser } from "../auth";
import { assertAdmin } from "./guard";

export type TransitionType = "FEE" | "SALARY";

export interface Transition {
  id: string;
  type: TransitionType;
  flow: "IN" | "OUT"; // money coming into the school or going out
  date: Date;
  amount: number;
  method: string;
  who: string; // the student or staff member
  whoHref: string | null;
  forLabel: string; // what it was for
  note: string | null;
}

/** Date filter on paid-on. `from` and `to` are inclusive days (UTC midnight). A single day uses the same value for both. */
function paidOnRange(from?: Date | null, to?: Date | null): Prisma.DateTimeFilter | undefined {
  if (!from && !to) return undefined;
  const range: Prisma.DateTimeFilter = {};
  if (from) range.gte = from;
  if (to) range.lt = new Date(to.getTime() + 86_400_000); // end of the "to" day
  return range;
}

/**
 * Recent school money in and out: student fee payments (in) and salary payments (out).
 * Loans and other expenses are not included. Newest first, one page at a time.
 */
export async function recentTransitions(
  me: CurrentUser,
  opts: { type?: TransitionType | null; from?: Date | null; to?: Date | null; page?: number; pageSize?: number } = {},
) {
  assertAdmin(me);
  const pageSize = Math.min(Math.max(opts.pageSize ?? 20, 1), 100);
  const page = Math.max(opts.page ?? 1, 1);
  // Fetch enough from each source to cover this page once the two lists are merged.
  const limit = page * pageSize;
  const wantFee = !opts.type || opts.type === "FEE";
  const wantSalary = !opts.type || opts.type === "SALARY";
  const paidOn = paidOnRange(opts.from, opts.to);

  const [fees, salaries, feeCount, salaryCount] = await Promise.all([
    wantFee
      ? db.feePayment.findMany({
          where: paidOn ? { paidOn } : undefined,
          include: { student: { select: { id: true, firstName: true, lastName: true } }, feeItem: { select: { name: true } } },
          orderBy: { paidOn: "desc" },
          take: limit,
        })
      : [],
    wantSalary
      ? db.salaryPayment.findMany({
          where: paidOn ? { paidOn } : undefined,
          include: { staff: { select: { id: true, name: true } } },
          orderBy: { paidOn: "desc" },
          take: limit,
        })
      : [],
    wantFee ? db.feePayment.count({ where: paidOn ? { paidOn } : undefined }) : 0,
    wantSalary ? db.salaryPayment.count({ where: paidOn ? { paidOn } : undefined }) : 0,
  ]);

  const rows: Transition[] = [
    ...fees.map((p) => ({
      id: `fee-${p.id}`,
      type: "FEE" as const,
      flow: "IN" as const,
      date: p.paidOn,
      amount: p.amount,
      method: p.method,
      who: `${p.student.firstName} ${p.student.lastName}`,
      whoHref: `/students/${p.student.id}`,
      forLabel: p.feeItem?.name ?? "General payment",
      note: p.note,
    })),
    ...salaries.map((p) => ({
      id: `salary-${p.id}`,
      type: "SALARY" as const,
      flow: "OUT" as const,
      date: p.paidOn,
      amount: p.amount,
      method: p.method,
      who: p.staff.name,
      whoHref: `/staff/${p.staff.id}`,
      forLabel: `Salary for ${p.forMonth}`,
      note: p.note,
    })),
  ];

  const total = feeCount + salaryCount;
  const sorted = rows.sort((a, b) => b.date.getTime() - a.date.getTime());
  return {
    rows: sorted.slice((page - 1) * pageSize, page * pageSize),
    total,
    page,
    pages: Math.max(Math.ceil(total / pageSize), 1),
  };
}
