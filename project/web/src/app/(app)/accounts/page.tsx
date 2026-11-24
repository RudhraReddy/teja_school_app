import { requirePageUser } from "@/lib/auth";
import { listUsers } from "@/lib/services/users";
import { classLabel } from "@/lib/services/classes";
import { createUserAction, resetPasswordAction, setUserActiveAction } from "@/app/actions";
import { Badge, Card, PageHeader, Table, td } from "@/components/ui";
import { ConfirmButton } from "@/components/forms";
import { AccountForm, ResetPasswordForm } from "./account-forms";

export const metadata = { title: "Accounts" };

export default async function AccountsPage() {
  const me = await requirePageUser("ADMIN");
  const users = await listUsers(me);
  return (
    <>
      <PageHeader title="Accounts" subtitle="Admins and teachers who can sign in to the portal" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Table head={["Name", "Role", "Class teacher of", "Status", ""]}>
            {users.map((u) => (
              <tr key={u.id} className={u.active ? "" : "opacity-60"}>
                <td className={td}>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted">{u.email}{u.phone && ` · ${u.phone}`}</p>
                </td>
                <td className={td}>
                  <Badge tone={u.role === "ADMIN" ? "blue" : "gray"}>{u.role === "ADMIN" ? "Admin" : "Teacher"}</Badge>
                </td>
                <td className={td}>{u.classesTaught.map(classLabel).join(", ") || "—"}</td>
                <td className={td}>
                  <Badge tone={u.active ? "green" : "gray"}>{u.active ? "Active" : "Disabled"}</Badge>
                </td>
                <td className={`${td} text-right`}>
                  {u.id !== me.id && (
                    <div className="flex flex-col items-end gap-2">
                      <ConfirmButton
                        action={setUserActiveAction.bind(null, u.id, !u.active)}
                        confirm={u.active ? `Disable ${u.name}? They will no longer be able to sign in.` : undefined}
                        variant="secondary"
                      >
                        {u.active ? "Disable" : "Enable"}
                      </ConfirmButton>
                      <ResetPasswordForm action={resetPasswordAction.bind(null, u.id)} />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        </Card>
        <Card title="Add account" className="self-start">
          <AccountForm action={createUserAction} />
        </Card>
      </div>
    </>
  );
}
