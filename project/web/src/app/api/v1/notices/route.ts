import { body, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { createNotice, listNotices } from "@/lib/services/notices";

export const GET = route(async () => {
  await requireUser();
  return { notices: await listNotices() };
});

export const POST = route(async (req) => ({ notice: await createNotice(await requireUser(), await body(req)) }));
