import { body, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { updateUser } from "@/lib/services/users";

export const PATCH = route<{ id: string }>(async (req, { id }) => ({ user: await updateUser(await requireUser(), id, await body(req)) }));
