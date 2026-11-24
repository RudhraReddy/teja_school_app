type Day = { day: number; date: Date; kind: "paid" | "unpaid" | null };

const SQUARE = {
  none: "bg-subtle",
  paid: "bg-brand",
  unpaid: "bg-red-500",
} as const;

/** GitHub-style grid: one square per day of the month, weeks as columns, Sunday at the top. */
export function LeaveCalendar({ days, firstWeekday, paidDays, unpaidDays }: { days: Day[]; firstWeekday: number; paidDays: number; unpaidDays: number }) {
  const leaveDays = paidDays + unpaidDays;
  const total = days.length;
  const cells: (Day | null)[] = [...Array<null>(firstWeekday).fill(null), ...days];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Day | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div>
      <p className="text-3xl font-semibold tabular-nums">
        {leaveDays}/{total}
        <span className="ml-2 text-base font-normal text-muted">leave days this month</span>
      </p>
      <p className="mt-1 text-xs text-muted">
        {unpaidDays} unpaid · {paidDays} paid
      </p>

      <div className="mt-5 overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell, di) =>
                cell ? (
                  <div
                    key={di}
                    title={`${cell.date.toUTCString().slice(0, 16)}${cell.kind ? ` · ${cell.kind === "paid" ? "Paid leave" : "Unpaid leave"}` : ""}`}
                    className={`h-4 w-4 rounded-sm ${SQUARE[cell.kind ?? "none"]}`}
                  />
                ) : (
                  <div key={di} className="h-4 w-4" />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-sm ${SQUARE.none}`} /> No leave
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-sm ${SQUARE.paid}`} /> Paid leave
        </span>
        <span className="flex items-center gap-1.5">
          <span className={`h-3 w-3 rounded-sm ${SQUARE.unpaid}`} /> Unpaid leave (reduces salary)
        </span>
      </div>
    </div>
  );
}
