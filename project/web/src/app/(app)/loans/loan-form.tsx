"use client";

import Link from "next/link";
import type { ActionState } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Field, SelectField, TextAreaField, buttonClass } from "@/components/ui";
import { inputDate } from "@/lib/format";

export function LoanForm({ action, cancelHref }: { action: (s: ActionState, fd: FormData) => Promise<ActionState>; cancelHref: string }) {
  return (
    <ActionForm action={action} resetOnSuccess={false} className="grid gap-4 sm:grid-cols-2">
      {(err) => (
        <>
          <SelectField label="Direction" name="direction" defaultValue="BORROWED" error={err.direction} className="sm:col-span-2">
            <option value="BORROWED">We borrowed (we repay)</option>
            <option value="LENT">We lent (we receive repayments)</option>
          </SelectField>
          <Field label="Bank or person" name="counterparty" required placeholder="e.g. State Bank of India, or name" error={err.counterparty} className="sm:col-span-2" />
          <Field label="Amount (₹)" name="principal" type="number" min={1} step={1} required error={err.principal} />
          <Field label="Annual interest rate (%)" name="annualRate" type="number" min={0} max={100} step="0.01" defaultValue="0" required error={err.annualRate} />
          <SelectField label="Repayment frequency" name="frequency" defaultValue="MONTHLY" error={err.frequency}>
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
          </SelectField>
          <Field
            label="Monthly payment (₹, optional)"
            name="installment"
            type="number"
            min={1}
            step={1}
            error={err.installment}
            className="sm:col-span-2"
          />
          <p className="-mt-2 text-xs text-muted sm:col-span-2">
            The amount to pay at each due date. Leave blank to treat the whole balance as due.
          </p>
          <Field label="Start date" name="startDate" type="date" required defaultValue={inputDate(new Date())} error={err.startDate} />
          <Field label="First due date" name="firstDueDate" type="date" error={err.firstDueDate} />
          <p className="-mt-2 text-xs text-muted sm:col-span-2">
            Leave the first due date empty to use one period after the start date.
          </p>
          <Field
            label="Late fee (% per missed due date)"
            name="lateFeePercent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            defaultValue="0"
            error={err.lateFeePercent}
            className="sm:col-span-2"
          />
          <p className="-mt-2 text-xs text-muted sm:col-span-2">0 means no late fee. Each due date with no repayment since the last one adds this % of the balance.</p>
          <TextAreaField label="Note (optional)" name="note" rows={2} className="sm:col-span-2" />
          <div className="flex items-end justify-end gap-2 sm:col-span-2">
            <Link href={cancelHref} className={buttonClass("secondary")}>
              Cancel
            </Link>
            <SubmitButton>Save loan</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
