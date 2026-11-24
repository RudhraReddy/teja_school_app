import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { getClass, classLabel } from "@/lib/services/classes";
import { listTeachersForSelect } from "@/lib/services/users";
import { feeBalances } from "@/lib/services/fees";
import { deleteClassAction, updateClassAction } from "@/app/actions";
import { loadOr404 } from "@/lib/page";
import { Badge, Card, Empty, PageHeader, Table, td } from "@/components/ui";
import { ConfirmButton } from "@/components/forms";
import { inr } from "@/lib/format";
import { EditClassButton } from "./edit-class-button";

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageUser();
  const { id } = await params;
  const [cls, teachers, balances] = await Promise.all([loadOr404(() => getClass(id)), listTeachersForSelect(), feeBalances({ classId: id, includeInactive: true })]);
  const balanceOf = new Map(balances.map((b) => [b.student.id, b.balance]));
  const isAdmin = user.role === "ADMIN";

  return (
    <>
      <PageHeader
        title={classLabel(cls)}
        subtitle={`${cls.students.length} students${cls.room ? ` · Room ${cls.room}` : ""} · Class teacher: ${cls.classTeacher?.name ?? "not assigned"}`}
        action={
          isAdmin && (
            <div className="flex flex-wrap gap-2">
              <EditClassButton
                action={updateClassAction.bind(null, id)}
                teachers={teachers}
                defaults={{ name: cls.name, section: cls.section, room: cls.room, classTeacherId: cls.classTeacherId }}
              />
              <ConfirmButton action={deleteClassAction.bind(null, id)} confirm="Delete this class? Its students will become unassigned. Their fees are kept.">
                Delete
              </ConfirmButton>
            </div>
          )
        }
      />
      <Card title="Students">
        {cls.students.length === 0 ? (
          <Empty>No students in this class yet.</Empty>
        ) : (
          <Table head={["Name", "Admission no.", "Parent phone", "Fee"]}>
            {cls.students.map((s) => {
              const bal = balanceOf.get(s.id) ?? 0;
              return (
                <tr key={s.id}>
                  <td className={td}>
                    <Link href={`/students/${s.id}`} className="font-medium text-ink hover:underline">
                      {s.firstName} {s.lastName}
                    </Link>
                    {s.status === "INACTIVE" && (
                      <span className="ml-2">
                        <Badge>Inactive</Badge>
                      </span>
                    )}
                  </td>
                  <td className={`${td} tabular-nums`}>{s.admissionNo}</td>
                  <td className={td}>{s.guardianPhones[0] ?? "—"}</td>
                  <td className={td}>{bal > 0 ? <span className="tabular-nums text-red-700 dark:text-red-400">{inr(bal)}</span> : <Badge tone="green">All paid</Badge>}</td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>
    </>
  );
}
