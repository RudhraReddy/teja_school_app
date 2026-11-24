import Link from "next/link";
import { requirePageUser } from "@/lib/auth";
import { listClasses, classLabel } from "@/lib/services/classes";
import { listTeachersForSelect } from "@/lib/services/users";
import { Empty, PageHeader, inputClass } from "@/components/ui";
import { AutoFilterForm } from "@/components/auto-filter-form";
import { NewClassButton } from "./new-class-button";

export const metadata = { title: "Classes" };

type SP = Promise<{ q?: string }>;

export default async function ClassesPage({ searchParams }: { searchParams: SP }) {
  const user = await requirePageUser();
  const isAdmin = user.role === "ADMIN";
  const sp = await searchParams;
  const [allClasses, teachers] = await Promise.all([listClasses(), listTeachersForSelect()]);

  const q = sp.q?.trim().toLowerCase() ?? "";
  const classes = q
    ? allClasses.filter((c) =>
        [c.name, c.section, c.room ?? "", c.classTeacher?.name ?? ""].some((field) => field.toLowerCase().includes(q)),
      )
    : allClasses;

  return (
    <>
      <PageHeader title="Classes" subtitle={`${allClasses.length} classes`} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <AutoFilterForm className="flex min-w-0 items-center gap-2">
          <input name="q" defaultValue={sp.q ?? ""} placeholder="Search class, room or teacher…" aria-label="Search classes" className={`${inputClass} w-64 max-w-full`} />
        </AutoFilterForm>
        {isAdmin && <NewClassButton teachers={teachers} />}
      </div>

      {classes.length === 0 ? (
        <Empty>
          {q ? "No classes match your search." : `No classes yet.${isAdmin ? " Use “New Class” to create the first one." : ""}`}
        </Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <Link key={c.id} href={`/classes/${c.id}`} className="rounded-xl border border-line bg-surface p-4 shadow-sm transition hover:border-brand/40">
              <p className="font-semibold">{classLabel(c)}</p>
              <p className="mt-1 text-sm text-muted">
                {c._count.students} {c._count.students === 1 ? "student" : "students"}
                {c.room && ` · Room ${c.room}`}
              </p>
              <p className="mt-3 text-xs text-muted">Class teacher: {c.classTeacher?.name ?? "Not assigned"}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
