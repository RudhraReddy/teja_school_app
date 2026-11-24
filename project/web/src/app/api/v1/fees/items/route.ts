import { body, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { addFeeItem } from "@/lib/services/fees";

/** Adds a fee to one student. Body: { studentId, name, amount, dueDate? } */
export const POST = route(async (req) => {
  const data = (await body(req)) as { studentId?: string } & Record<string, unknown>;
  return { item: await addFeeItem(await requireUser(), String(data.studentId ?? ""), data) };
});
