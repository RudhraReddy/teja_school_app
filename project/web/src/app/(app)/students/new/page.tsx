import { requirePageUser } from "@/lib/auth";
import { listClasses, classLabel } from "@/lib/services/classes";
import { createStudentAction } from "@/app/actions";
import { Card, PageHeader } from "@/components/ui";
import { StudentForm } from "../student-form";

export const metadata = { title: "Add student" };

export default async function NewStudentPage() {
  await requirePageUser("ADMIN");
  const classes = (await listClasses()).map((c) => ({ id: c.id, label: classLabel(c) }));
  return (
    <>
      <PageHeader title="Add student" subtitle="Name, admission number and parent details. Fees can be added here or later from the student's page." />
      <Card>
        <StudentForm action={createStudentAction} classes={classes} cancelHref="/students" showFees />
      </Card>
    </>
  );
}
