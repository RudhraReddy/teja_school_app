import { body, route } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { createStudent, listStudents } from "@/lib/services/students";

export const GET = route(async (req) => {
  await requireUser();
  const sp = new URL(req.url).searchParams;
  return listStudents({
    q: sp.get("q"),
    classId: sp.get("classId"),
    status: sp.get("status") as "ACTIVE" | "INACTIVE" | "ALL" | null,
    page: Number(sp.get("page") ?? 1) || 1,
    pageSize: Number(sp.get("pageSize") ?? 25) || 25,
  });
});

export const POST = route(async (req) => ({ student: await createStudent(await requireUser(), await body(req)) }));
