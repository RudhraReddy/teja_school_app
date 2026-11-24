import { route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { feeBalances } from "@/lib/services/fees";

export const GET = route(async (req) => {
  await requireUser();
  return { balances: await feeBalances({ classId: new URL(req.url).searchParams.get("classId") }) };
});
