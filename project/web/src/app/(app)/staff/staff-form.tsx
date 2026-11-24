"use client";

import Link from "next/link";
import type { ActionState } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Field, SelectField, buttonClass } from "@/components/ui";
import { inputDate } from "@/lib/format";

export interface StaffDefaults {
  name?: string;
  gender?: string | null;
  dateOfBirth?: Date | string | null;
  joiningDate?: Date | string | null;
  subject?: string | null;
  monthlySalary?: number;
}

export function StaffForm({
  action,
  defaults = {},
  cancelHref,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  defaults?: StaffDefaults;
  cancelHref: string;
}) {
  return (
    <ActionForm action={action} resetOnSuccess={false} className="grid gap-4 sm:grid-cols-2">
      {(err) => (
        <>
          <Field label="Full name" name="name" defaultValue={defaults.name} required error={err.name} className="sm:col-span-2" />
          <SelectField label="Gender" name="gender" defaultValue={defaults.gender ?? ""} error={err.gender}>
            <option value="">Not specified</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </SelectField>
          <Field label="Date of birth" name="dateOfBirth" type="date" defaultValue={inputDate(defaults.dateOfBirth)} error={err.dateOfBirth} />
          <Field
            label="Joining date"
            name="joiningDate"
            type="date"
            required
            defaultValue={inputDate(defaults.joiningDate ?? new Date())}
            error={err.joiningDate}
          />
          <Field label="Subject / role" name="subject" defaultValue={defaults.subject ?? ""} placeholder="e.g. Mathematics, Accounts, Peon" error={err.subject} />
          <Field
            label="Monthly salary (₹)"
            name="monthlySalary"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={defaults.monthlySalary ?? ""}
            error={err.monthlySalary}
            className="sm:col-span-2"
          />
          <div className="flex items-end justify-end gap-2 sm:col-span-2">
            <Link href={cancelHref} className={buttonClass("secondary")}>
              Cancel
            </Link>
            <SubmitButton>Save staff member</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
