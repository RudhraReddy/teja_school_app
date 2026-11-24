import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { adminOverview } from "@/lib/services/admin";
import { Badge, Card, Empty, PageHeader, Table, td } from "@/components/ui";
import { date, inr } from "@/lib/format";

export const metadata = { title: "Admin overview" };

type SP = Promise<{ month?: string }>;

const PAGES = [
  { href: "/students", label: "Students", note: "Student list, profiles, fees and payments" },
  { href: "/students/new", label: "Add student", note: "Register a new student" },
  { href: "/classes", label: "Classes", note: "Classes, sections and class teachers" },
  { href: "/notices", label: "Notices", note: "Post and read notices" },
  { href: "/transport", label: "Transport", note: "Transport routes and vehicles (coming soon)" },
  { href: "/staff", label: "Staff", note: "Staff records, salary and leave" },
  { href: "/staff/new", label: "Add staff", note: "Register a staff member" },
  { href: "/transitions", label: "Transitions", note: "Recent money in and out: fee payments, salaries, loan repayments" },
  { href: "/loans", label: "Loans", note: "Money borrowed and lent, with interest and repayments" },
  { href: "/accounts", label: "Accounts", note: "Login accounts for admins and teachers" },
  { href: "/admin", label: "Admin overview", note: "This page: everything in one place" },
];

const DEFAULT_MONTH = (() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
})();

function Section({ title, count, children, defaultOpen = false }: { title: string; count: number; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-line bg-surface shadow-sm">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold text-ink">
        <span>
          {title} <span className="ml-1 text-sm font-normal text-muted">({count})</span>
        </span>
        <span className="text-muted transition group-open:rotate-90">›</span>
      </summary>
      <div className="border-t border-line px-5 pb-5 pt-2">{children}</div>
    </details>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: SP }) {
  const me = await requirePageUser("ADMIN");
  const sp = await searchParams;
  const month = sp.month && /^\d{4}-(0[1-9]|1[0-2])$/.test(sp.month) ? sp.month : DEFAULT_MONTH;
  const d = await adminOverview(me, month);
  const t = d.totals;

  const tiles = [
    ["Students", `${t.activeStudents}`, `${t.allStudents} including left`],
    ["Classes", `${t.classes}`, "Nursery to 12th"],
    ["Fees outstanding", inr(t.outstanding), "Across all students"],
    ["Collected (all time)", inr(t.collectedAllTime), "Student fee payments"],
    ["Active staff", `${t.activeStaff}`, `${d.staff.length} including left`],
    ["Monthly salary bill", inr(t.staffMonthlyBill), "Active staff, before leave"],
  ];

  return (
    <>
      <PageHeader title="Admin overview" subtitle="Every page and every record in one place. Admin only." />

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {tiles.map(([label, value, sub]) => (
          <div key={label} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <p className="text-xs font-medium text-muted">{label}</p>
            <p className="mt-2 text-xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-muted">{sub}</p>
          </div>
        ))}
      </div>

      <Card title="All pages" className="mb-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PAGES.map((p) => (
            <Link key={p.href} href={p.href} className="rounded-lg border border-line p-4 transition hover:border-brand/50 hover:bg-subtle">
              <p className="font-medium text-ink">{p.label}</p>
              <p className="mt-1 text-xs text-muted">{p.note}</p>
              <p className="mt-2 font-mono text-[11px] text-muted">{p.href}</p>
            </Link>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        <Section title="Login accounts" count={d.users.length}>
          <Table head={["Name", "Email", "Role", "Status"]}>
            {d.users.map((u) => (
              <tr key={u.id} className={u.active ? "" : "opacity-60"}>
                <td className={td}>{u.name}</td>
                <td className={td}>{u.email}</td>
                <td className={td}>{u.role === "ADMIN" ? "Admin" : "Teacher"}</td>
                <td className={td}>
                  <Badge tone={u.active ? "green" : "gray"}>{u.active ? "Active" : "Disabled"}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        </Section>

        <Section title="Notices" count={d.notices.length}>
          {d.notices.length === 0 ? (
            <Empty>No notices yet.</Empty>
          ) : (
            <Table head={["Title", "Audience", "Posted by", "Date", "Pinned"]}>
              {d.notices.map((n) => (
                <tr key={n.id}>
                  <td className={td}>{n.title}</td>
                  <td className={td}>{n.audience === "ALL" ? "Everyone" : "Teachers"}</td>
                  <td className={td}>{n.author?.name ?? "School office"}</td>
                  <td className={td}>{date(n.createdAt)}</td>
                  <td className={td}>{n.pinned ? "Yes" : "—"}</td>
                </tr>
              ))}
            </Table>
          )}
        </Section>
      </div>
    </>
  );
}
