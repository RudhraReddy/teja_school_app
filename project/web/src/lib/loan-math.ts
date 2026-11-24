/**
 * Loan maths. Pure functions, no database, so they are easy to test.
 *
 * Rules (what the school agreed, see doc/plan-v2.md):
 * - Interest is added once a month, on the anniversary of the start date.
 * - SIMPLE: interest is charged on the unpaid principal only. Interest is not added to the principal.
 * - COMPOUND: each month's interest is added to the principal, so later interest is charged on it too.
 * - Payments go to late fees first, then unpaid interest, then principal.
 * - Late fee: at each due date with no repayment since the previous due date, add lateFeePercent% of the
 *   outstanding principal and interest. 0% means no late fee (the default).
 * - Money is whole rupees for the user; the maths keeps decimals and rounds only for display.
 */

export type RepaymentFrequency = "MONTHLY" | "QUARTERLY" | "YEARLY";
export type InterestType = "SIMPLE" | "COMPOUND";

export interface LoanTerms {
  principal: number;
  annualRate: number; // percent per year
  interestType: InterestType;
  startDate: Date;
  frequency: RepaymentFrequency;
  firstDueDate: Date;
  lateFeePercent: number;
}

export interface Repayment {
  amount: number;
  paidOn: Date;
}

const MONTHS_PER_PERIOD: Record<RepaymentFrequency, number> = { MONTHLY: 1, QUARTERLY: 3, YEARLY: 12 };
const ORDER = { accrue: 0, pay: 1, due: 2 } as const;

/** Adds whole months in UTC, so dates stay at midnight UTC. */
export function addMonths(d: Date, months: number) {
  const x = new Date(d.getTime());
  x.setUTCMonth(x.getUTCMonth() + months);
  return x;
}

export function calculateLoan(loan: LoanTerms, repayments: Repayment[], asOf: Date) {
  const now = asOf.getTime();
  const monthlyRate = loan.annualRate / 100 / 12;
  const periodMonths = MONTHS_PER_PERIOD[loan.frequency];

  type Event = { at: number; kind: keyof typeof ORDER; amount?: number };
  const events: Event[] = [];

  for (let k = 1; ; k++) {
    const at = addMonths(loan.startDate, k).getTime();
    if (at > now) break;
    events.push({ at, kind: "accrue" });
  }
  const dueDates: number[] = [];
  for (let j = 0; ; j++) {
    const at = addMonths(loan.firstDueDate, j * periodMonths).getTime();
    if (at > now) break;
    dueDates.push(at);
    events.push({ at, kind: "due" });
  }
  for (const r of repayments) {
    if (r.paidOn.getTime() <= now) events.push({ at: r.paidOn.getTime(), kind: "pay", amount: r.amount });
  }
  events.sort((a, b) => a.at - b.at || ORDER[a.kind] - ORDER[b.kind]);

  let principalDue = loan.principal; // includes capitalised interest for COMPOUND
  let interestDue = 0; // unpaid interest, SIMPLE only
  let lateFeesDue = 0;
  let interestCharged = 0;
  let lateFeesCharged = 0;
  let paid = 0;
  let overpaid = 0;
  let paidSinceLastDue = false;
  let missedDues = 0;

  for (const e of events) {
    if (e.kind === "accrue") {
      const interest = principalDue * monthlyRate;
      interestCharged += interest;
      if (loan.interestType === "COMPOUND") principalDue += interest;
      else interestDue += interest;
    } else if (e.kind === "pay") {
      const amount = e.amount ?? 0;
      paid += amount;
      if (amount > 0) paidSinceLastDue = true;
      let rest = amount;
      const toFees = Math.min(rest, lateFeesDue);
      lateFeesDue -= toFees;
      rest -= toFees;
      const toInterest = Math.min(rest, interestDue);
      interestDue -= toInterest;
      rest -= toInterest;
      const toPrincipal = Math.min(rest, principalDue);
      principalDue -= toPrincipal;
      rest -= toPrincipal;
      overpaid += rest;
    } else {
      // A due date. Charge a late fee if nothing was paid since the previous due date.
      if (!paidSinceLastDue && principalDue + interestDue > 0.005 && loan.lateFeePercent > 0) {
        const fee = ((principalDue + interestDue) * loan.lateFeePercent) / 100;
        lateFeesDue += fee;
        lateFeesCharged += fee;
        missedDues += 1;
      }
      paidSinceLastDue = false;
    }
  }

  const outstanding = principalDue + interestDue + lateFeesDue;
  const closed = outstanding < 0.5;

  // Next due date: the first scheduled date after asOf (none once the loan is closed).
  let nextDueDate: Date | null = null;
  if (!closed) {
    for (let j = 0; j < 10_000; j++) {
      const at = addMonths(loan.firstDueDate, j * periodMonths);
      if (at.getTime() > now) {
        nextDueDate = at;
        break;
      }
    }
  }

  return {
    outstanding: Math.round(outstanding),
    principalOutstanding: Math.round(principalDue),
    interestOutstanding: Math.round(interestDue),
    lateFeesOutstanding: Math.round(lateFeesDue),
    interestCharged: Math.round(interestCharged),
    lateFeesCharged: Math.round(lateFeesCharged),
    paid: Math.round(paid),
    overpaid: Math.round(overpaid),
    missedDues,
    closed,
    nextDueDate,
  };
}

/**
 * This month's view of one loan.
 * - thisMonthDue: what falls due in the current calendar month. The monthly payment (or the whole balance when no
 *   monthly payment is set), if a due date falls in this month and the loan is still open.
 * - carryOver: scheduled payments from earlier months that were not covered by repayments.
 *   Only worked out when a monthly payment is set.
 */
export function monthView(
  loan: { installment?: number | null; frequency: RepaymentFrequency; firstDueDate: Date },
  repayments: Repayment[],
  outstanding: number,
  asOf: Date,
) {
  const monthStart = new Date(Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth(), 1));
  const nextMonth = addMonths(monthStart, 1);
  const periodMonths = MONTHS_PER_PERIOD[loan.frequency];

  const dueDates: Date[] = [];
  for (let j = 0; j < 10_000; j++) {
    const d = addMonths(loan.firstDueDate, j * periodMonths);
    if (d.getTime() >= nextMonth.getTime()) break;
    dueDates.push(d);
  }

  const open = outstanding >= 0.5;
  const dueThisMonth = dueDates.filter((d) => d.getTime() >= monthStart.getTime()).length;
  const dueBefore = dueDates.filter((d) => d.getTime() < monthStart.getTime()).length;
  const paidBefore = repayments.filter((r) => r.paidOn.getTime() < monthStart.getTime()).reduce((s, r) => s + r.amount, 0);

  const installment = loan.installment ?? null;
  const thisMonthDue = open && dueThisMonth > 0 ? (installment ? Math.min(installment * dueThisMonth, outstanding) : outstanding) : 0;
  const carryOver = open && installment ? Math.min(Math.max(0, installment * dueBefore - paidBefore), outstanding) : 0;

  return { thisMonthDue: Math.round(thisMonthDue), carryOver: Math.round(carryOver) };
}
