import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { getStudent } from "@/lib/services/students";
import { studentFeeSummary } from "@/lib/services/fees";
import { classLabel } from "@/lib/services/classes";
import { deleteFeeItemAction, deleteStudentAction } from "@/app/actions";
import { loadOr404 } from "@/lib/page";
import { Badge, Card, Empty, LinkButton, PageHeader, Table, td } from "@/components/ui";
import { ConfirmButton } from "@/components/forms";
import { date, inr, PAYMENT_METHODS } from "@/lib/format";
import { PaymentForm } from "./payment-form";
import { AddFeeButton } from "./add-fee";
import { PaymentButton } from "./payment-button";
import { StudentDetailsButton } from "./student-details-button";

export const metadata = { title: "Student" };

export default async function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePageUser();
  const { id } = await params;
  const student = await loadOr404(() => getStudent(id));
  const fees = await studentFeeSummary(id);
  const isAdmin = user.role === "ADMIN";

  const details: [string, React.ReactNode][] = [
    ["Admission no.", student.admissionNo],
    ["Class", student.class ? <Link className="text-ink" href={`/classes/${student.class.id}`}>{classLabel(student.class)}</Link> : "Unassigned"],
    ["Class teacher", student.class?.classTeacher?.name ?? "—"],
    ["Date of birth", date(student.dateOfBirth)],
    ["Gender", student.gender ? student.gender[0] + student.gender.slice(1).toLowerCase() : "—"],
    ["Parent / guardian", student.guardianName ?? "—"],
    [
      "Phone numbers",
      student.guardianPhones.length === 0 ? (
        "—"
      ) : (
        <span className="flex flex-wrap gap-x-3">
          {student.guardianPhones.map((p) => (
            <a key={p} className="text-ink" href={`tel:${p}`}>
              {p}
            </a>
          ))}
        </span>
      ),
    ],
    ["Address", student.address ?? "—"],
    ["Notes", student.notes ? <span className="whitespace-pre-line">{student.notes}</span> : "—"],
  ];

  return (
    <>
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        subtitle={<Badge tone={student.status === "ACTIVE" ? "green" : "gray"}>{student.status === "ACTIVE" ? "Active" : "Inactive"}</Badge>}
        action={
          <div className="flex flex-wrap gap-2">
            <StudentDetailsButton items={details} />
            {isAdmin && (
              <>
                <LinkButton href={`/students/${id}/edit`} variant="secondary">
                  Edit
                </LinkButton>
                <ConfirmButton action={deleteStudentAction.bind(null, id)} confirm="Delete this student and all their fee records? This cannot be undone.">
                  Delete
                </ConfirmButton>
              </>
            )}
          </div>
        }
      />

      <div className="space-y-6">
          <Card
            title="Fees"
            action={
              isAdmin && (
                <div className="flex flex-wrap items-center gap-2">
                  <PaymentButton
                    studentId={id}
                    items={fees.breakdown.map(({ item, balance }) => ({ id: item.id, label: `${item.name} (${inr(balance)} due)`, balance }))}
                  />
                  <AddFeeButton studentId={id} />
                </div>
              )
            }
          >
            <div className="mb-5 grid grid-cols-3 gap-3 text-center">
              {[
                ["Total fees", inr(fees.totalDue), ""],
                ["Paid", inr(fees.totalPaid), "text-green-700 dark:text-green-400"],
                ["Balance", inr(fees.balance), fees.balance > 0 ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"],
              ].map(([label, value, cls]) => (
                <div key={label} className="rounded-lg bg-subtle p-3">
                  <p className="text-xs text-muted">{label}</p>
                  <p className={`mt-1 text-lg font-semibold tabular-nums ${cls}`}>{value}</p>
                </div>
              ))}
            </div>
            {fees.breakdown.length === 0 ? (
              <Empty>No fees yet. {isAdmin ? "Use “+ Fee” to add one, such as transport, a class trip or books." : ""}</Empty>
            ) : (
              <Table head={["Fee", "Due date", "Amount", "Paid", "Balance", ""]}>
                {fees.breakdown.map(({ item, paid, balance }) => (
                  <tr key={item.id}>
                    <td className={td}>{item.name}</td>
                    <td className={td}>{date(item.dueDate)}</td>
                    <td className={`${td} tabular-nums`}>{inr(item.amount)}</td>
                    <td className={`${td} tabular-nums`}>{inr(paid)}</td>
                    <td className={td}>{balance === 0 ? <Badge tone="green">Paid</Badge> : <span className="tabular-nums">{inr(balance)}</span>}</td>
                    <td className={`${td} text-right`}>
                      {isAdmin && (
                        <ConfirmButton action={deleteFeeItemAction.bind(null, id, item.id)} confirm={`Remove “${item.name}”? Payments already made stay in the history.`} variant="secondary">
                          Remove
                        </ConfirmButton>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>

          <Card title="Payment history">
            {fees.payments.length === 0 ? (
              <Empty>No payments recorded.</Empty>
            ) : (
              <Table head={["Receipt", "Date", "For", "Method", "Amount"]}>
                {fees.payments.map((p) => (
                  <tr key={p.id}>
                    <td className={`${td} font-mono text-xs`}>{p.receiptNo}</td>
                    <td className={td}>{date(p.paidOn)}</td>
                    <td className={td}>
                      {p.feeItem?.name ?? "General"}
                      {p.note && <span className="block text-xs text-muted">{p.note}</span>}
                    </td>
                    <td className={td}>{PAYMENT_METHODS[p.method]}</td>
                    <td className={`${td} tabular-nums font-medium`}>{inr(p.amount)}</td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>
      </div>
    </>
  );
}
