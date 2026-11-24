import { requirePageUser } from "@/lib/auth";
import { createStaffAction } from "@/app/actions";
import { Card, PageHeader } from "@/components/ui";
import { StaffForm } from "../staff-form";

export const metadata = { title: "Add staff member" };

export default async function NewStaffPage() {
  await requirePageUser("ADMIN");
  return (
    <>
      <PageHeader title="Add staff member" />
      <Card>
        <StaffForm action={createStaffAction} cancelHref="/staff" />
      </Card>
    </>
  );
}
