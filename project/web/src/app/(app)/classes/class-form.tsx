"use client";

import type { ActionState } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Field, SelectField } from "@/components/ui";

export function ClassForm({
  action,
  teachers,
  defaults,
  submitLabel,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  teachers: { id: string; name: string }[];
  defaults?: { name: string; section: string; room: string | null; classTeacherId: string | null };
  submitLabel: string;
}) {
  return (
    <ActionForm action={action} resetOnSuccess={!defaults} successMessage={defaults ? "Saved." : "Class created."}>
      {(err) => (
        <>
          <div className="grid grid-cols-[1fr_90px] gap-3">
            <Field label="Class name" name="name" placeholder="Grade 8" defaultValue={defaults?.name} required error={err.name} />
            <Field label="Section" name="section" placeholder="A" defaultValue={defaults?.section} />
          </div>
          <Field label="Room" name="room" placeholder="e.g. 204" defaultValue={defaults?.room ?? ""} />
          <SelectField label="Class teacher" name="classTeacherId" defaultValue={defaults?.classTeacherId ?? ""}>
            <option value="">Not assigned</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </SelectField>
          <SubmitButton>{submitLabel}</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
