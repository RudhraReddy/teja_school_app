import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { listStaff, ageOn } from "@/lib/services/staff";
import { Badge, Card, Empty, LinkButton, PageHeader, Table, buttonClass, inputClass, td } from "@/components/ui";
import { date, inr } from "@/lib/format";
import { AutoFilterForm } from "@/components/auto-filter-form";

export const metadata = { title: "Staff" };

type SP = Promise<{ q?: string; status?: string }>;

export default async function StaffPage({ searchParams }: { searchParams: SP }) {
  const me = await requirePageUser("ADMIN");
  const sp = await searchParams;
  const status = (["ACTIVE", "INACTIVE", "ALL"].includes(sp.status ?? "") ? sp.status : "ACTIVE") as "ACTIVE" | "INACTIVE" | "ALL";
  const staff = await listStaff(me, { q: sp.q, status });
  const monthlyTotal = staff.filter((s) => s.active).reduce((sum, s) => sum + s.monthlySalary, 0);

  return (
    <>
      <PageHeader
        title="Staff"
        subtitle={`${staff.length} ${staff.length === 1 ? "person" : "people"} · Monthly salary bill ${inr(monthlyTotal)} (active staff)`}
        action={<LinkButton href="/staff/new">Add staff member</LinkButton>}
      />
      <Card>
        <AutoFilterForm className="mb-4 grid gap-3 sm:grid-cols-[1fr_160px]">
          <input name="q" defaultValue={sp.q} placeholder="Search name or subject…" className={inputClass} />
          <select name="status" defaultValue={status} className={inputClass}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Left / inactive</option>
            <option value="ALL">All</option>
          </select>
        </AutoFilterForm>
        {staff.length === 0 ? (
          <Empty>
            No staff match. <Link href="/staff/new" className="text-ink">Add one</Link>
          </Empty>
        ) : (
          <Table head={["Name", "Subject / role", "Joined", "Age", "Monthly salary", "Status"]}>
            {staff.map((s) => (
              <tr key={s.id} className="hover:bg-subtle/60">
                <td className={td}>
                  <Link href={`/staff/${s.id}`} className="font-medium text-ink hover:underline">
                    {s.name}
                  </Link>
                </td>
                <td className={td}>{s.subject ?? "—"}</td>
                <td className={td}>{date(s.joiningDate)}</td>
                <td className={`${td} tabular-nums`}>{ageOn(s.dateOfBirth) ?? "—"}</td>
                <td className={`${td} tabular-nums`}>{inr(s.monthlySalary)}</td>
                <td className={td}>
                  <Badge tone={s.active ? "green" : "gray"}>{s.active ? "Active" : "Left"}</Badge>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  );
}
