import { body, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { createUser, listUsers } from "@/lib/services/users";

export const GET = route(async () => ({ users: await listUsers(await requireUser()) }));

export const POST = route(async (req) => ({ user: await createUser(await requireUser(), await body(req)) }));
