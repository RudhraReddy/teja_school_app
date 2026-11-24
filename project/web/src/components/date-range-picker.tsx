"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buttonClass } from "./ui";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const pad = (n: number) => String(n).padStart(2, "0");
const isDay = (s?: string | null): s is string => !!s && /^\d{4}-\d{2}-\d{2}$/.test(s);
const shortDate = (s: string) =>
  new Date(`${s}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * One control for a date or a date range.
 * Click a day to start, click a second day to end. The list updates straight away.
 * Clicking the same day twice selects that one day. Reset (inside the calendar) clears the filter.
 */
export function DateRangePicker({ from, to, type }: { from?: string; to?: string; type?: string }) {
  const router = useRouter();
  const appliedFrom = isDay(from) ? from : "";
  const appliedTo = isDay(to) ? to : "";

  const [open, setOpen] = useState(false);
  const [start, setStart] = useState(appliedFrom);
  const [end, setEnd] = useState(appliedTo);
  const [view, setView] = useState(() => {
    const d = new Date(`${(appliedFrom || todayIso())}T00:00:00Z`);
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
  });
  const ref = useRef<HTMLDivElement>(null);

  // Keep in step when the page changes the URL (for example after Reset or a page turn).
  useEffect(() => {
    setStart(appliedFrom);
    setEnd(appliedTo);
  }, [appliedFrom, appliedTo]);

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  function apply(s: string, e: string) {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (s) params.set("from", s);
    if (s && e && e !== s) params.set("to", e);
    const qs = params.toString();
    router.push(qs ? `/transitions?${qs}` : "/transitions");
  }

  function pick(day: string) {
    // First click, or a click before the start: begin a new range.
    if (!start || (start && end) || day < start) {
      setStart(day);
      setEnd("");
      return;
    }
    // Second click: the range is complete, so apply it.
    setEnd(day);
    apply(start, day);
    setOpen(false);
  }

  function reset() {
    setStart("");
    setEnd("");
    apply("", "");
    setOpen(false);
  }

  const shift = (months: number) => {
    setView((v) => {
      const d = new Date(Date.UTC(v.y, v.m + months, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    });
  };

  const firstWeekday = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${view.y}-${pad(view.m + 1)}-${pad(i + 1)}`),
  ];

  const hi = end || start;
  const inRange = (day: string) => (start && hi ? day >= (start < hi ? start : hi) && day <= (start < hi ? hi : start) : false);

  const buttonText = appliedFrom
    ? appliedTo && appliedTo !== appliedFrom
      ? `${shortDate(appliedFrom)} – ${shortDate(appliedTo)}`
      : shortDate(appliedFrom)
    : "Pick dates";

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className={buttonClass("secondary")} aria-expanded={open}>
        {buttonText}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-line bg-surface p-3 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className="rounded-lg px-2 py-1 text-ink hover:bg-subtle">
              ‹
            </button>
            <span className="text-sm font-semibold text-ink">
              {new Date(Date.UTC(view.y, view.m, 1)).toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" })}
            </span>
            <button type="button" onClick={() => shift(1)} aria-label="Next month" className="rounded-lg px-2 py-1 text-ink hover:bg-subtle">
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1">
                {w}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) =>
              day ? (
                <button
                  key={day}
                  type="button"
                  onClick={() => pick(day)}
                  aria-label={shortDate(day)}
                  aria-pressed={inRange(day)}
                  className={`h-8 rounded-md text-sm tabular-nums transition ${
                    day === start || day === end
                      ? "bg-brand text-white"
                      : inRange(day)
                        ? "bg-brand/20 text-ink"
                        : "text-ink hover:bg-subtle"
                  }`}
                >
                  {Number(day.slice(8))}
                </button>
              ) : (
                <span key={`e${i}`} />
              ),
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-xs text-muted">{!start || (start && end) ? "Pick a start date" : "Now pick an end date"}</p>
            <button type="button" onClick={reset} className={buttonClass("secondary")}>
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
