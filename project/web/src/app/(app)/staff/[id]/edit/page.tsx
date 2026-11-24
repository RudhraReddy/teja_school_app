import { requirePageUser } from "@/lib/auth";
import { getStaff } from "@/lib/services/staff";
import { updateStaffAction } from "@/app/actions";
import { Card, PageHeader } from "@/components/ui";
import { StaffForm } from "../../staff-form";
import { loadOr404 } from "@/lib/page";

export const metadata = { title: "Edit staff member" };

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requirePageUser("ADMIN");
  const { id } = await params;
  const member = await loadOr404(() => getStaff(me, id));
  return (
    <>
      <PageHeader title={`Edit ${member.name}`} />
      <Card>
        <StaffForm
          action={updateStaffAction.bind(null, id)}
          defaults={member}
          cancelHref={`/staff/${id}`}
        />
      </Card>
    </>
  );
}
