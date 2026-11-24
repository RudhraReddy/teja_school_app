import { body, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { deleteClass, getClass, updateClass } from "@/lib/services/classes";

type P = { id: string };

export const GET = route<P>(async (_req, { id }) => {
  await requireUser();
  return { class: await getClass(id) };
});

export const PATCH = route<P>(async (req, { id }) => ({ class: await updateClass(await requireUser(), id, await body(req)) }));

export const DELETE = route<P>(async (_req, { id }) => {
  await deleteClass(await requireUser(), id);
});
