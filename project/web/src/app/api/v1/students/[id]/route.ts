import { body, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { deleteStudent, getStudent, updateStudent } from "@/lib/services/students";

type P = { id: string };

export const GET = route<P>(async (_req, { id }) => {
  await requireUser();
  return { student: await getStudent(id) };
});

export const PATCH = route<P>(async (req, { id }) => ({ student: await updateStudent(await requireUser(), id, await body(req)) }));

export const DELETE = route<P>(async (_req, { id }) => {
  await deleteStudent(await requireUser(), id);
});
