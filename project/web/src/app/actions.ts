"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { toAppError } from "@/lib/api";
import * as classes from "@/lib/services/classes";
import * as students from "@/lib/services/students";
import * as notices from "@/lib/services/notices";
import * as fees from "@/lib/services/fees";
import * as users from "@/lib/services/users";
import * as staff from "@/lib/services/staff";
import * as loans from "@/lib/services/loans";

export type ActionState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string[] | undefined>; at?: number } | null;

const form = (fd: FormData) => Object.fromEntries([...fd.entries()].filter(([k]) => !k.startsWith("$ACTION")));

async function run(fn: () => Promise<unknown>, paths: string[]): Promise<ActionState> {
  try {
    await fn();
  } catch (err) {
    const e = toAppError(err);
    return { error: e.message, fieldErrors: e.details as Record<string, string[]> | undefined, at: Date.now() };
  }
  paths.forEach((p) => revalidatePath(p));
  return { ok: true, at: Date.now() };
}

// ---- Classes
export async function createClassAction(_: ActionState, fd: FormData) {
  return run(async () => classes.createClass(await requireUser(), form(fd)), ["/classes"]);
}
export async function updateClassAction(id: string, _: ActionState, fd: FormData) {
  return run(async () => classes.updateClass(await requireUser(), id, form(fd)), ["/classes", `/classes/${id}`]);
}
export async function deleteClassAction(id: string) {
  const res = await run(async () => classes.deleteClass(await requireUser(), id), ["/classes"]);
  if (res?.ok) redirect("/classes");
  return res;
}

// ---- Students
/** Student forms repeat some fields (phone numbers, fees), so read those as lists. */
function studentForm(fd: FormData) {
  const names = fd.getAll("feeName").map(String);
  const amounts = fd.getAll("feeAmount").map(String);
  const dues = fd.getAll("feeDueDate").map(String);
  const fees = names
    .map((name, i) => ({ name, amount: amounts[i] ?? "", dueDate: dues[i] ?? "" }))
    .filter((f) => f.name.trim() !== "" || f.amount.trim() !== "");
  return { ...form(fd), guardianPhones: fd.getAll("guardianPhone").map(String), fees };
}

export async function createStudentAction(_: ActionState, fd: FormData) {
  let id = "";
  const res = await run(async () => {
    id = (await students.createStudent(await requireUser(), studentForm(fd))).id;
  }, ["/students"]);
  if (res?.ok) redirect(`/students/${id}`);
  return res;
}
export async function updateStudentAction(id: string, _: ActionState, fd: FormData) {
  const res = await run(async () => students.updateStudent(await requireUser(), id, studentForm(fd)), ["/students", `/students/${id}`]);
  if (res?.ok) redirect(`/students/${id}`);
  return res;
}
export async function deleteStudentAction(id: string) {
  const res = await run(async () => students.deleteStudent(await requireUser(), id), ["/students"]);
  if (res?.ok) redirect("/students");
  return res;
}

// ---- Notices
export async function createNoticeAction(_: ActionState, fd: FormData) {
  return run(async () => notices.createNotice(await requireUser(), form(fd)), ["/notices"]);
}
export async function deleteNoticeAction(id: string) {
  return run(async () => notices.deleteNotice(await requireUser(), id), ["/notices"]);
}

// ---- Fees
export async function addFeeAction(studentId: string, _: ActionState, fd: FormData) {
  return run(async () => fees.addFeeItem(await requireUser(), studentId, form(fd)), [`/students/${studentId}`, "/students"]);
}
export async function deleteFeeItemAction(studentId: string, id: string) {
  return run(async () => fees.deleteFeeItem(await requireUser(), id), [`/students/${studentId}`, "/students"]);
}
export async function recordPaymentAction(_: ActionState, fd: FormData) {
  const data = form(fd);
  return run(async () => fees.recordPayment(await requireUser(), data), ["/students", `/students/${data.studentId}`]);
}

// ---- Staff records (salary, leave)
export async function createStaffAction(_: ActionState, fd: FormData) {
  let id = "";
  const res = await run(async () => {
    id = (await staff.createStaff(await requireUser(), form(fd))).id;
  }, ["/staff"]);
  if (res?.ok) redirect(`/staff/${id}`);
  return res;
}
export async function updateStaffAction(id: string, _: ActionState, fd: FormData) {
  const res = await run(async () => staff.updateStaff(await requireUser(), id, form(fd)), ["/staff", `/staff/${id}`]);
  if (res?.ok) redirect(`/staff/${id}`);
  return res;
}
export async function setStaffActiveAction(id: string, active: boolean) {
  return run(async () => staff.setStaffActive(await requireUser(), id, active), ["/staff", `/staff/${id}`]);
}
export async function recordSalaryPaymentAction(_: ActionState, fd: FormData) {
  const data = form(fd);
  return run(async () => staff.recordSalaryPayment(await requireUser(), data), [`/staff/${data.staffId}`]);
}
export async function logLeaveAction(_: ActionState, fd: FormData) {
  const data = form(fd);
  return run(async () => staff.logLeave(await requireUser(), data), [`/staff/${data.staffId}`]);
}
export async function deleteLeaveAction(staffId: string, id: string) {
  return run(async () => staff.deleteLeave(await requireUser(), id), [`/staff/${staffId}`]);
}

// ---- Loans
export async function createLoanAction(_: ActionState, fd: FormData) {
  let id = "";
  const res = await run(async () => {
    id = (await loans.createLoan(await requireUser(), form(fd))).id;
  }, ["/loans"]);
  if (res?.ok) redirect(`/loans/${id}`);
  return res;
}
export async function recordRepaymentAction(_: ActionState, fd: FormData) {
  const data = form(fd);
  return run(async () => loans.recordRepayment(await requireUser(), data), ["/loans", `/loans/${data.loanId}`]);
}

// ---- Accounts (login users)
export async function createUserAction(_: ActionState, fd: FormData) {
  return run(async () => users.createUser(await requireUser(), form(fd)), ["/staff"]);
}
export async function setUserActiveAction(id: string, active: boolean) {
  return run(async () => users.updateUser(await requireUser(), id, { active }), ["/staff"]);
}
export async function resetPasswordAction(id: string, _: ActionState, fd: FormData) {
  return run(async () => users.updateUser(await requireUser(), id, { password: fd.get("password") }), ["/staff"]);
}
