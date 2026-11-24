import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { listLoans, loanTotals } from "@/lib/services/loans";
import { Badge, Card, Empty, LinkButton, PageHeader, Table, td } from "@/components/ui";
import { date, inr } from "@/lib/format";

export const metadata = { title: "Loans" };

const DIRECTION = { BORROWED: "We borrowed", LENT: "We lent" } as const;

export default async function LoansPage() {
  const me = await requirePageUser("ADMIN");
  const rows = await listLoans(me);
  const t = loanTotals(rows);

  return (
    <>
      <PageHeader title="Loans" subtitle="Money the school has borrowed" action={<LinkButton href="/loans/new">Add loan</LinkButton>} />

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          ["Still owed", inr(t.stillOwed), "Total left to repay"],
          ["This month pay", inr(t.thisMonthPay), "Due in this month"],
          ["Carry over", inr(t.carryOver), "Missed from earlier months"],
        ].map(([label, value, sub]) => (
          <div key={label} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <p className="text-xs font-medium text-muted">{label}</p>
            <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted">{sub}</p>
          </div>
        ))}
      </div>

      <Card>
        {rows.length === 0 ? (
          <Empty>
            No loans yet. <Link href="/loans/new" className="text-ink">Add the first one</Link>
          </Empty>
        ) : (
          <Table head={["Bank or person", "Direction", "Borrowed", "Rate", "Outstanding", "Next due", "Status"]}>
            {rows.map(({ loan, calc }) => (
              <tr key={loan.id} className="hover:bg-subtle/60">
                <td className={td}>
                  <Link href={`/loans/${loan.id}`} className="font-medium text-ink hover:underline">
                    {loan.counterparty}
                  </Link>
                  <span className="block text-xs text-muted">Started {date(loan.startDate)}</span>
                </td>
                <td className={td}>{DIRECTION[loan.direction]}</td>
                <td className={`${td} tabular-nums`}>{inr(loan.principal)}</td>
                <td className={`${td} tabular-nums`}>{loan.annualRate}%</td>
                <td className={`${td} tabular-nums font-medium`}>{calc.closed ? "—" : inr(calc.outstanding)}</td>
                <td className={td}>{calc.closed ? "—" : date(calc.nextDueDate)}</td>
                <td className={td}>{calc.closed ? <Badge tone="green">Closed</Badge> : <Badge tone="amber">Open</Badge>}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  );
}
