import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { recentTransitions, type TransitionType } from "@/lib/services/transitions";
import { Badge, Card, Empty, PageHeader, Table, buttonClass, td } from "@/components/ui";
import { date, inr, PAYMENT_METHODS } from "@/lib/format";
import { DateRangePicker } from "@/components/date-range-picker";

export const metadata = { title: "Transitions" };

type SP = Promise<{ type?: string; page?: string; from?: string; to?: string }>;

/** "2026-11-24" → UTC midnight, or null if blank or not a date. */
const parseDay = (s?: string) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? new Date(`${s}T00:00:00Z`) : null);

const PAGE = 20;

const FILTERS: { key: "ALL" | TransitionType; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "FEE", label: "Fee" },
  { key: "SALARY", label: "Salary" },
];

const TYPE_TONE = { FEE: "green", SALARY: "amber" } as const;
const TYPE_LABEL = { FEE: "Fee", SALARY: "Salary" } as const;

export default async function TransitionsPage({ searchParams }: { searchParams: SP }) {
  const me = await requirePageUser("ADMIN");
  const sp = await searchParams;
  const active = (FILTERS.find((f) => f.key === sp.type)?.key ?? "ALL") as "ALL" | TransitionType;
  const requested = Math.floor(Number(sp.page)) || 1;
  // One date = that day. Two dates = the range between them (inclusive).
  const fromDay = parseDay(sp.from);
  const toDay = parseDay(sp.to) ?? fromDay;
  const { rows, total, page, pages } = await recentTransitions(me, {
    type: active === "ALL" ? null : active,
    from: fromDay,
    to: toDay,
    page: requested,
    pageSize: PAGE,
  });
  const filterParams = (extra: Record<string, string>) => {
    const params = new URLSearchParams({
      ...(active !== "ALL" ? { type: active } : {}),
      ...(sp.from ? { from: sp.from } : {}),
      ...(sp.to ? { to: sp.to } : {}),
      ...extra,
    });
    return `/transitions?${params}`;
  };
  const pageHref = (p: number) => filterParams({ page: String(p) });
  const firstShown = total === 0 ? 0 : (page - 1) * PAGE + 1;
  const lastShown = (page - 1) * PAGE + rows.length;

  return (
    <>
      <PageHeader title="Transitions" subtitle="Recent fee payments and salary payments" />

      <div className="mb-6 grid grid-cols-2 gap-3">
        {[
          ["Fees received", inr(rows.filter((r) => r.flow === "IN").reduce((s, r) => s + r.amount, 0)), "Student fee payments shown"],
          ["Salaries paid", inr(rows.filter((r) => r.flow === "OUT").reduce((s, r) => s + r.amount, 0)), "Staff salary payments shown"],
        ].map(([label, value, sub]) => (
          <div key={label} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <p className="text-xs font-medium text-muted">{label}</p>
            <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted">{sub}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link key={f.key} href={f.key === "ALL" ? "/transitions" : `/transitions?type=${f.key}`} className={buttonClass(active === f.key ? "primary" : "secondary")}>
              {f.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker from={sp.from} to={sp.to} type={active === "ALL" ? undefined : active} />

          <span className="px-1 text-sm tabular-nums text-muted">
            {firstShown}–{lastShown} of {total}
          </span>
          {page > 1 ? (
            <Link href={pageHref(page - 1)} aria-label="Previous page" className={buttonClass("secondary")}>
              ‹
            </Link>
          ) : (
            <span className={`${buttonClass("secondary")} opacity-40`} aria-hidden>
              ‹
            </span>
          )}
          {page < pages ? (
            <Link href={pageHref(page + 1)} aria-label="Next page" className={buttonClass("secondary")}>
              ›
            </Link>
          ) : (
            <span className={`${buttonClass("secondary")} opacity-40`} aria-hidden>
              ›
            </span>
          )}
        </div>
      </div>

      <Card>
        {rows.length === 0 ? (
          <Empty>No payments recorded yet.</Empty>
        ) : (
          <Table head={["Date", "Type", "Who", "For", "Method", "Amount"]}>
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-subtle/60">
                <td className={`${td} whitespace-nowrap`}>{date(r.date)}</td>
                <td className={td}>
                  <Badge tone={TYPE_TONE[r.type]}>{TYPE_LABEL[r.type]}</Badge>
                </td>
                <td className={td}>
                  {r.whoHref ? (
                    <Link href={r.whoHref} className="font-medium text-ink hover:underline">
                      {r.who}
                    </Link>
                  ) : (
                    r.who
                  )}
                </td>
                <td className={td}>
                  {r.forLabel}
                  {r.note && <span className="block text-xs text-muted">{r.note}</span>}
                </td>
                <td className={td}>{PAYMENT_METHODS[r.method] ?? r.method}</td>
                <td className={`${td} whitespace-nowrap tabular-nums font-medium ${r.flow === "IN" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                  {r.flow === "IN" ? "+" : "−"} {inr(r.amount)}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  );
}
