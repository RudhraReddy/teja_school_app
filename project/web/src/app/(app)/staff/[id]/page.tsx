import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { ageOn, getStaff, leaveDayGrid, payrollFor } from "@/lib/services/staff";
import { deleteLeaveAction, setStaffActiveAction } from "@/app/actions";
import { loadOr404 } from "@/lib/page";
import { Badge, Card, Empty, LinkButton, PageHeader, Table, buttonClass, inputClass, td } from "@/components/ui";
import { ConfirmButton } from "@/components/forms";
import { date, inr, PAYMENT_METHODS } from "@/lib/format";
import { AutoFilterForm } from "@/components/auto-filter-form";
import { SalaryForm } from "./salary-form";
import { LeaveForm } from "./leave-form";
import { LeaveCalendar } from "./leave-calendar";

export const metadata = { title: "Staff member" };

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function StaffProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const me = await requirePageUser("ADMIN");
  const { id } = await params;
  const sp = await searchParams;
  const member = await loadOr404(() => getStaff(me, id));
  const month = sp.month && /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.month) ? sp.month : currentMonth();
  const pay = payrollFor(member, month, member.leaves, member.salaryPayments);
  const grid = leaveDayGrid(month, member.leaves);
  const paidDays = grid.days.filter((d) => d.kind === "paid").length;
  const unpaidDays = grid.days.filter((d) => d.kind === "unpaid").length;
  const age = ageOn(member.dateOfBirth);
  const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));

  const details: [string, React.ReactNode][] = [
    ["Subject / role", member.subject ?? "—"],
    ["Gender", member.gender ? member.gender[0] + member.gender.slice(1).toLowerCase() : "—"],
    ["Age", age === null ? "—" : `${age} years`],
    ["Date of birth", date(member.dateOfBirth)],
    ["Joining date", date(member.joiningDate)],
    ["Monthly salary", inr(member.monthlySalary)],
  ];

  return (
    <>
      <PageHeader
        title={member.name}
        subtitle={<Badge tone={member.active ? "green" : "gray"}>{member.active ? "Active" : "Left / inactive"}</Badge>}
        action={
          <div className="flex flex-wrap gap-2">
            <LinkButton href={`/staff/${id}/edit`} variant="secondary">
              Edit
            </LinkButton>
            <ConfirmButton
              action={setStaffActiveAction.bind(null, id, !member.active)}
              confirm={member.active ? `Mark ${member.name} as left? They will move to the inactive list.` : undefined}
              variant="secondary"
            >
              {member.active ? "Mark as left" : "Reactivate"}
            </ConfirmButton>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Details">
          <dl className="space-y-3 text-sm">
            {details.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted">{k}</dt>
                <dd className="mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card
            title={`Salary · ${monthLabel}`}
            action={
              <AutoFilterForm className="flex items-center gap-2">
                <input type="month" name="month" defaultValue={month} className={`${inputClass} w-auto`} />
              </AutoFilterForm>
            }
          >
            <div className="mb-5 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              {[
                ["Salary", inr(pay.monthlySalary), ""],
                [
                  `Leave deduction (${pay.unpaidLeaveDays} unpaid days)`,
                  pay.leaveDeduction ? `− ${inr(pay.leaveDeduction)}` : inr(0),
                  pay.leaveDeduction ? "text-red-700 dark:text-red-400" : "",
                ],
                ["Net for month", inr(pay.netSalary), ""],
                [
                  pay.balance < 0 ? "Overpaid" : "Still due",
                  inr(Math.abs(pay.balance)),
                  pay.balance > 0 ? "text-red-700 dark:text-red-400" : pay.balance < 0 ? "text-amber-700 dark:text-amber-400" : "text-green-700 dark:text-green-400",
                ],
              ].map(([label, value, cls]) => (
                <div key={label} className="rounded-lg bg-subtle p-3">
                  <p className="text-xs text-muted">{label}</p>
                  <p className={`mt-1 text-lg font-semibold tabular-nums ${cls}`}>{value}</p>
                </div>
              ))}
            </div>
            <p className="mb-4 text-xs text-muted">
              Paid for this month: {inr(pay.paid)}. Each unpaid leave day reduces salary by monthly salary ÷ {pay.daysInMonth} days.
            </p>
            <SalaryForm staffId={id} month={month} suggestedAmount={Math.max(pay.balance, 0)} />
          </Card>

          <Card title="Salary payments">
            {member.salaryPayments.length === 0 ? (
              <Empty>No salary payments recorded yet.</Empty>
            ) : (
              <Table head={["Paid on", "For month", "Method", "Amount"]}>
                {member.salaryPayments.map((p) => (
                  <tr key={p.id}>
                    <td className={td}>
                      {date(p.paidOn)}
                      {p.note && <span className="block text-xs text-muted">{p.note}</span>}
                    </td>
                    <td className={`${td} tabular-nums`}>{p.forMonth}</td>
                    <td className={td}>{PAYMENT_METHODS[p.method]}</td>
                    <td className={`${td} tabular-nums font-medium`}>{inr(p.amount)}</td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>

          <Card title="Leave">
            <LeaveCalendar days={grid.days} firstWeekday={grid.firstWeekday} paidDays={paidDays} unpaidDays={unpaidDays} />

            <div className="mt-6 border-t border-line pt-6">
              <h3 className="mb-4 text-sm font-semibold">Log approved leave</h3>
              <LeaveForm staffId={id} />
            </div>

            <div className="mt-6 border-t border-line pt-6">
              <h3 className="mb-4 text-sm font-semibold">All leave</h3>
              {member.leaves.length === 0 ? (
                <Empty>No leave logged.</Empty>
              ) : (
                <Table head={["Dates", "Days", "Type", ""]}>
                  {member.leaves.map((l) => (
                    <tr key={l.id}>
                      <td className={td}>
                        {date(l.startDate)}
                        {l.endDate.getTime() !== l.startDate.getTime() && <span> – {date(l.endDate)}</span>}
                        {l.reason && <span className="block text-xs text-muted">{l.reason}</span>}
                      </td>
                      <td className={`${td} tabular-nums`}>{l.days}</td>
                      <td className={td}>
                        <Badge tone={l.isPaid ? "blue" : "red"}>{l.isPaid ? "Paid" : "Unpaid"}</Badge>
                      </td>
                      <td className={`${td} text-right`}>
                        <ConfirmButton action={deleteLeaveAction.bind(null, id, l.id)} confirm="Delete this leave entry?" variant="secondary">
                          Delete
                        </ConfirmButton>
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </div>
          </Card>
        </div>
      </div>
      <p className="mt-6 text-xs text-muted">
        <Link href="/staff" className="text-ink">
          ← Back to staff
        </Link>
      </p>
    </>
  );
}
