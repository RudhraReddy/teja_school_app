import { db } from "../db";
import type { CurrentUser } from "../auth";
import { assertAdmin } from "./guard";
import { feeBalances, listPayments } from "./fees";
import { listClasses } from "./classes";
import { listUsers } from "./users";
import { payrollFor } from "./staff";

/** Everything the admin overview page shows. Admin only. */
export async function adminOverview(me: CurrentUser, month: string) {
  assertAdmin(me);
  const [students, classes, feeItems, balances, payments, staffRows, users, notices, salaryPayments] = await Promise.all([
    db.student.findMany({
      include: { class: { select: { id: true, name: true, section: true } } },
      orderBy: [{ status: "asc" }, { firstName: "asc" }],
    }),
    listClasses(),
    db.feeItem.findMany({
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
        _count: { select: { payments: true } },
      },
      orderBy: [{ studentId: "asc" }, { createdAt: "asc" }],
    }),
    feeBalances({ includeInactive: true }),
    listPayments(500),
    db.staffMember.findMany({ include: { leaves: true, salaryPayments: true }, orderBy: [{ active: "desc" }, { name: "asc" }] }),
    listUsers(me),
    db.notice.findMany({ include: { author: { select: { name: true } } }, orderBy: { createdAt: "desc" } }),
    db.salaryPayment.findMany({
      include: { staff: { select: { id: true, name: true } } },
      orderBy: { paidOn: "desc" },
      take: 500,
    }),
  ]);

  const staff = staffRows.map((s) => ({
    ...s,
    pay: payrollFor(s, month, s.leaves, s.salaryPayments),
  }));

  const balanceByStudent = new Map(balances.map((b) => [b.student.id, b.balance]));
  const studentsWithBalance = students.map((s) => ({ ...s, balance: balanceByStudent.get(s.id) ?? 0 }));

  return {
    month,
    students: studentsWithBalance,
    classes,
    feeItems,
    payments,
    staff,
    salaryPayments,
    users,
    notices,
    totals: {
      activeStudents: students.filter((s) => s.status === "ACTIVE").length,
      allStudents: students.length,
      classes: classes.length,
      outstanding: balances.reduce((sum, b) => sum + b.balance, 0),
      collectedAllTime: payments.reduce((sum, p) => sum + p.amount, 0),
      activeStaff: staff.filter((s) => s.active).length,
      staffMonthlyBill: staff.filter((s) => s.active).reduce((sum, s) => sum + s.monthlySalary, 0),
      accounts: users.length,
      notices: notices.length,
    },
  };
}
