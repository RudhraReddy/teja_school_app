import { db } from "../db";
import { notFound } from "../errors";
import type { CurrentUser } from "../auth";
import { loanRepaymentSchema, loanSchema } from "../validators";
import { assertAdmin } from "./guard";
import { addMonths, calculateLoan, monthView } from "../loan-math";

const PERIOD_MONTHS = { MONTHLY: 1, QUARTERLY: 3, YEARLY: 12 } as const;

/** Loans with their calculated balance and this month's view, as of a given day (default: now). */
export async function listLoans(me: CurrentUser, asOf: Date = new Date()) {
  assertAdmin(me);
  const loans = await db.loan.findMany({
    include: { repayments: { orderBy: { paidOn: "asc" } } },
    orderBy: [{ startDate: "desc" }],
  });
  return loans.map((loan) => {
    const calc = calculateLoan(loan, loan.repayments, asOf);
    const month = monthView(loan, loan.repayments, calc.outstanding, asOf);
    return { loan, calc, month };
  });
}

export async function getLoan(me: CurrentUser, id: string, asOf: Date = new Date()) {
  assertAdmin(me);
  const loan = await db.loan.findUnique({
    where: { id },
    include: {
      repayments: { orderBy: { paidOn: "desc" } },
      createdBy: { select: { name: true } },
    },
  });
  if (!loan) throw notFound("Loan");
  const asc = [...loan.repayments].reverse();
  const calc = calculateLoan(loan, asc, asOf);
  const month = monthView(loan, asc, calc.outstanding, asOf);
  return { loan, calc, month };
}

export async function createLoan(me: CurrentUser, input: unknown) {
  assertAdmin(me);
  const data = loanSchema.parse(input);
  // If no first due date is given, the first instalment falls one period after the start.
  const firstDueDate = data.firstDueDate ?? addMonths(data.startDate, PERIOD_MONTHS[data.frequency]);
  return db.loan.create({ data: { ...data, firstDueDate, createdById: me.id } });
}

export async function recordRepayment(me: CurrentUser, input: unknown) {
  assertAdmin(me);
  const { paidOn, ...rest } = loanRepaymentSchema.parse(input);
  const exists = await db.loan.findUnique({ where: { id: rest.loanId }, select: { id: true } });
  if (!exists) throw notFound("Loan");
  return db.loanRepayment.create({ data: { ...rest, ...(paidOn ? { paidOn } : {}), recordedById: me.id } });
}

/**
 * The three totals on the Loans page. Only money we owe (borrowed loans) is counted.
 * - stillOwed: everything still to repay
 * - thisMonthPay: what falls due this calendar month
 * - carryOver: scheduled payments from earlier months that are not yet covered
 */
export function loanTotals(rows: { loan: { direction: string }; calc: { outstanding: number }; month: { thisMonthDue: number; carryOver: number } }[]) {
  const borrowed = rows.filter((r) => r.loan.direction === "BORROWED");
  return {
    stillOwed: borrowed.reduce((s, r) => s + r.calc.outstanding, 0),
    thisMonthPay: borrowed.reduce((s, r) => s + r.month.thisMonthDue, 0),
    carryOver: borrowed.reduce((s, r) => s + r.month.carryOver, 0),
  };
}
