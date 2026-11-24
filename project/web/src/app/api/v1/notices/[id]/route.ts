import { body, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { deleteNotice, updateNotice } from "@/lib/services/notices";

type P = { id: string };

export const PATCH = route<P>(async (req, { id }) => ({ notice: await updateNotice(await requireUser(), id, await body(req)) }));

export const DELETE = route<P>(async (_req, { id }) => {
  await deleteNotice(await requireUser(), id);
});
