import { body, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { createClass, listClasses } from "@/lib/services/classes";

export const GET = route(async () => {
  await requireUser();
  return { classes: await listClasses() };
});

export const POST = route(async (req) => ({ class: await createClass(await requireUser(), await body(req)) }));
