import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { getLoan } from "@/lib/services/loans";
import { loadOr404 } from "@/lib/page";
import { Badge, Card, Empty, PageHeader, Table, td } from "@/components/ui";
import { date, inr, PAYMENT_METHODS } from "@/lib/format";
import { RepaymentForm } from "./repayment-form";

export const metadata = { title: "Loan" };

const DIRECTION = { BORROWED: "We borrowed (we repay)", LENT: "We lent (we receive repayments)" } as const;
const FREQUENCY = { MONTHLY: "Monthly", QUARTERLY: "Quarterly", YEARLY: "Yearly" } as const;

export default async function LoanPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requirePageUser("ADMIN");
  const { id } = await params;
  const { loan, calc } = await loadOr404(() => getLoan(me, id));

  const tiles: [string, string, string][] = [
    ["Outstanding", calc.closed ? "Closed" : inr(calc.outstanding), calc.closed ? "Fully repaid" : `Principal ${inr(calc.principalOutstanding)} · Interest ${inr(calc.interestOutstanding)} · Late fees ${inr(calc.lateFeesOutstanding)}`],
    ["Interest charged", inr(calc.interestCharged), `${loan.annualRate}% a year, so far`],
    ["Late fees charged", inr(calc.lateFeesCharged), `${calc.missedDues} missed due date${calc.missedDues === 1 ? "" : "s"}`],
    ["Repaid so far", inr(calc.paid), `${loan.repayments.length} repayment${loan.repayments.length === 1 ? "" : "s"}`],
  ];

  const details: [string, React.ReactNode][] = [
    ["Direction", DIRECTION[loan.direction]],
    ["Original amount", inr(loan.principal)],
    ["Annual interest rate", `${loan.annualRate}%`],
    ["Monthly payment", loan.installment ? inr(loan.installment) : "Whole balance"],
    ["Repayment frequency", FREQUENCY[loan.frequency]],
    ["Start date", date(loan.startDate)],
    ["First due date", date(loan.firstDueDate)],
    ["Next due date", calc.closed ? "—" : date(calc.nextDueDate)],
    ["Late fee", loan.lateFeePercent > 0 ? `${loan.lateFeePercent}% per missed due date` : "None"],
    ["Note", loan.note ?? "—"],
  ];

  return (
    <>
      <PageHeader
        title={loan.counterparty}
        subtitle={calc.closed ? <Badge tone="green">Closed</Badge> : <Badge tone="amber">Open</Badge>}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map(([label, value, sub]) => (
          <div key={label} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <p className="text-xs font-medium text-muted">{label}</p>
            <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted">{sub}</p>
          </div>
        ))}
      </div>

      {calc.overpaid > 0 && (
        <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Repayments are {inr(calc.overpaid)} more than the loan balance. Check the amounts recorded below.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Loan terms">
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
          {!calc.closed && (
            <Card title="Record a repayment">
              <RepaymentForm loanId={loan.id} outstanding={calc.outstanding} />
            </Card>
          )}

          <Card title="Repayments">
            {loan.repayments.length === 0 ? (
              <Empty>No repayments recorded yet.</Empty>
            ) : (
              <Table head={["Paid on", "Method", "Amount"]}>
                {loan.repayments.map((r) => (
                  <tr key={r.id}>
                    <td className={td}>
                      {date(r.paidOn)}
                      {r.note && <span className="block text-xs text-muted">{r.note}</span>}
                    </td>
                    <td className={td}>{PAYMENT_METHODS[r.method]}</td>
                    <td className={`${td} tabular-nums font-medium`}>{inr(r.amount)}</td>
                  </tr>
                ))}
              </Table>
            )}
            <p className="mt-4 text-xs text-muted">
              Repayments are never edited or deleted. Interest is worked out month by month from the start date, using the balance at each point.
            </p>
          </Card>
        </div>
      </div>
      <p className="mt-6 text-xs text-muted">
        <Link href="/loans" className="text-ink">
          ← Back to loans
        </Link>
      </p>
    </>
  );
}
