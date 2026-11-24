import { route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { listTeachersForSelect } from "@/lib/services/users";

// Lightweight staff list for dropdowns (e.g. choosing a class teacher).
export const GET = route(async () => {
  await requireUser();
  return { teachers: await listTeachersForSelect() };
});
