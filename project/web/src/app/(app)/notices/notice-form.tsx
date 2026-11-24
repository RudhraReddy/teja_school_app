"use client";

import type { ActionState } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Field, SelectField, TextAreaField } from "@/components/ui";

export function NoticeForm({ action }: { action: (s: ActionState, fd: FormData) => Promise<ActionState> }) {
  return (
    <ActionForm action={action} successMessage="Notice posted.">
      {(err) => (
        <>
          <Field label="Title" name="title" required error={err.title} placeholder="e.g. Annual Day on 15 December" />
          <TextAreaField label="Message" name="body" rows={6} required error={err.body} />
          <SelectField label="Audience" name="audience" defaultValue="ALL">
            <option value="ALL">Everyone</option>
            <option value="TEACHERS">Staff only</option>
          </SelectField>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="pinned" className="h-4 w-4 accent-[var(--brand)]" /> Pin to top
          </label>
          <SubmitButton>Post notice</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
