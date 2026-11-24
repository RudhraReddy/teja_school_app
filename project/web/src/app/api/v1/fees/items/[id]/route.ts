import { route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { deleteFeeItem } from "@/lib/services/fees";

export const DELETE = route<{ id: string }>(async (_req, { id }) => {
  await deleteFeeItem(await requireUser(), id);
});
