import { requirePageUser } from "@/lib/auth";
import { getStudent } from "@/lib/services/students";
import { listClasses, classLabel } from "@/lib/services/classes";
import { updateStudentAction } from "@/app/actions";
import { Card, PageHeader } from "@/components/ui";
import { StudentForm } from "../../student-form";
import { loadOr404 } from "@/lib/page";

export const metadata = { title: "Edit student" };

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageUser("ADMIN");
  const { id } = await params;
  const [student, classes] = await Promise.all([loadOr404(() => getStudent(id)), listClasses()]);
  return (
    <>
      <PageHeader title={`Edit ${student.firstName} ${student.lastName}`} />
      <Card>
        <StudentForm
          action={updateStudentAction.bind(null, id)}
          classes={classes.map((c) => ({ id: c.id, label: classLabel(c) }))}
          defaults={student}
          cancelHref={`/students/${id}`}
        />
      </Card>
    </>
  );
}
