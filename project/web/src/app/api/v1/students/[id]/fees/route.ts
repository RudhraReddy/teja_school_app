import { route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { studentFeeSummary } from "@/lib/services/fees";

export const GET = route<{ id: string }>(async (_req, { id }) => {
  await requireUser();
  return studentFeeSummary(id);
});
