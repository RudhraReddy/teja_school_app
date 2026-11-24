import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { listStudents } from "@/lib/services/students";
import { listClasses, classLabel } from "@/lib/services/classes";
import { feeBalances } from "@/lib/services/fees";
import { Badge, Card, Empty, LinkButton, PageHeader, Table, buttonClass, inputClass, td } from "@/components/ui";
import { inr } from "@/lib/format";
import { AutoFilterForm } from "@/components/auto-filter-form";

export const metadata = { title: "Students" };

type SP = Promise<{ q?: string; classId?: string; status?: string; page?: string }>;

export default async function StudentsPage({ searchParams }: { searchParams: SP }) {
  const user = await requirePageUser();
  const sp = await searchParams;
  const status = (["ACTIVE", "INACTIVE", "ALL"].includes(sp.status ?? "") ? sp.status : "ACTIVE") as "ACTIVE" | "INACTIVE" | "ALL";
  const [{ students, total, page, pageSize, pages }, classes, balances] = await Promise.all([
    listStudents({ q: sp.q, classId: sp.classId, status, page: Number(sp.page) || 1 }),
    listClasses(),
    feeBalances({ includeInactive: true }),
  ]);
  const balanceOf = new Map(balances.map((b) => [b.student.id, b.balance]));
  const pageHref = (p: number) => `/students?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), ...(sp.classId ? { classId: sp.classId } : {}), status, page: String(p) })}`;
  const firstShown = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastShown = Math.min(page * pageSize, total);

  return (
    <>
      <PageHeader
        title="Students"
        subtitle={`${total} ${total === 1 ? "student" : "students"}`}
        action={user.role === "ADMIN" && <LinkButton href="/students/new">Add student</LinkButton>}
      />
      <Card>
        <div className="mb-4 flex items-center justify-between gap-2">
          <AutoFilterForm className="flex min-w-0 items-center gap-2">
            <input name="q" defaultValue={sp.q} placeholder="Search…" aria-label="Search students" className={`${inputClass} w-36 min-w-0`} />
            <select name="classId" defaultValue={sp.classId ?? ""} className={`${inputClass} w-32`}>
              <option value="">All classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {classLabel(c)}
                </option>
              ))}
            </select>
            <select name="status" defaultValue={status} className={`${inputClass} w-24`}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ALL">All</option>
            </select>
          </AutoFilterForm>

          <div className="flex shrink-0 items-center gap-2">
            <span className="whitespace-nowrap px-1 text-sm tabular-nums text-muted">
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

        {students.length === 0 ? (
          <Empty>
            No students match. {user.role === "ADMIN" && <Link href="/students/new" className="text-ink">Add one</Link>}
          </Empty>
        ) : (
          <Table head={["Name", "Class", "Fee", "Status"]}>
            {students.map((s) => {
              const bal = balanceOf.get(s.id) ?? 0;
              return (
                <tr key={s.id} className="hover:bg-subtle/60">
                  <td className={td}>
                    <Link href={`/students/${s.id}`} className="font-medium text-ink hover:underline">
                      {s.firstName} {s.lastName}
                    </Link>
                    <span className="block text-xs text-muted">{s.admissionNo}</span>
                  </td>
                  <td className={td}>{s.class ? classLabel(s.class) : <span className="text-muted">Unassigned</span>}</td>
                  <td className={`${td} tabular-nums`}>
                    {bal > 0 ? <span className="font-medium text-red-700 dark:text-red-400">{inr(bal)}</span> : <Badge tone="green">All paid</Badge>}
                  </td>
                  <td className={td}>
                    <Badge tone={s.status === "ACTIVE" ? "green" : "gray"}>{s.status === "ACTIVE" ? "Active" : "Inactive"}</Badge>
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>
    </>
  );
}
