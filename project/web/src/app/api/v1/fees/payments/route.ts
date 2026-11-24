import { body, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { listPayments, recordPayment } from "@/lib/services/fees";

export const GET = route(async () => {
  await requireUser();
  return { payments: await listPayments() };
});

export const POST = route(async (req) => ({ payment: await recordPayment(await requireUser(), await body(req)) }));
