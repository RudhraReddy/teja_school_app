"use client";

import { logLeaveAction } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Field } from "@/components/ui";
import { inputDate } from "@/lib/format";

export function LeaveForm({ staffId }: { staffId: string }) {
  const today = inputDate(new Date());
  return (
    <ActionForm action={logLeaveAction} successMessage="Leave logged." className="grid gap-4 sm:grid-cols-2">
      {(err) => (
        <>
          <input type="hidden" name="staffId" value={staffId} />
          <Field label="From" name="startDate" type="date" required defaultValue={today} error={err.startDate} />
          <Field label="To" name="endDate" type="date" required defaultValue={today} error={err.endDate} />
          <label className="flex items-center gap-2 text-sm text-ink sm:col-span-2">
            <input type="checkbox" name="isPaid" className="h-4 w-4 accent-brand" />
            Paid leave (does not reduce salary)
          </label>
          <Field label="Reason (optional)" name="reason" placeholder="e.g. Fever, family function" className="sm:col-span-2" />
          {err.isPaid?.[0] && <p className="text-xs text-red-600 sm:col-span-2">{err.isPaid[0]}</p>}
          <div className="flex justify-end sm:col-span-2">
            <SubmitButton>Log leave</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
