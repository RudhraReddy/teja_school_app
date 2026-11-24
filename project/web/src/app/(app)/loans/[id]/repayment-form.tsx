"use client";

import { recordRepaymentAction } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Field, SelectField } from "@/components/ui";
import { PAYMENT_METHODS, inputDate } from "@/lib/format";

export function RepaymentForm({ loanId, outstanding }: { loanId: string; outstanding: number }) {
  return (
    <ActionForm action={recordRepaymentAction} successMessage="Repayment recorded." className="grid gap-4 sm:grid-cols-2">
      {(err) => (
        <>
          <input type="hidden" name="loanId" value={loanId} />
          <Field label="Amount paid (₹)" name="amount" type="number" min={1} step={1} required defaultValue={outstanding > 0 ? outstanding : ""} error={err.amount} />
          <Field label="Date paid" name="paidOn" type="date" defaultValue={inputDate(new Date())} error={err.paidOn} />
          <SelectField label="Method" name="method" defaultValue="BANK_TRANSFER">
            {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </SelectField>
          <Field label="Note (optional)" name="note" placeholder="e.g. cheque no., UTR" />
          <div className="flex justify-end sm:col-span-2">
            <SubmitButton>Record repayment</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
