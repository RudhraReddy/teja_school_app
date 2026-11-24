"use client";

import { useState } from "react";
import type { ActionState } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Field, SelectField, inputClass } from "@/components/ui";

type Action = (s: ActionState, fd: FormData) => Promise<ActionState>;

export function AccountForm({ action }: { action: Action }) {
  return (
    <ActionForm action={action} successMessage="Account created. Share their email and password with them.">
      {(err) => (
        <>
          <Field label="Full name" name="name" required error={err.name} />
          <Field label="Email" name="email" type="email" required error={err.email} />
          <Field label="Phone" name="phone" type="tel" />
          <SelectField label="Role" name="role" defaultValue="TEACHER">
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </SelectField>
          <Field label="Temporary password" name="password" type="text" minLength={8} required error={err.password} />
          <SubmitButton>Create account</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}

export function ResetPasswordForm({ action }: { action: Action }) {
  const [open, setOpen] = useState(false);
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-xs text-ink">
        Reset password
      </button>
    );
  return (
    <ActionForm action={action} successMessage="Password updated." className="flex flex-col items-end gap-2">
      {(err) => (
        <>
          <input name="password" placeholder="New password (8+ chars)" minLength={8} required className={`${inputClass} w-48`} />
          {err.password?.[0] && <span className="text-xs text-red-600">{err.password[0]}</span>}
          <SubmitButton variant="secondary">Set password</SubmitButton>
        </>
      )}
    </ActionForm>
  );
}
