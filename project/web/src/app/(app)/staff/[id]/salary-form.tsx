"use client";

import { useState } from "react";
import { recordSalaryPaymentAction } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Field, SelectField } from "@/components/ui";
import { PAYMENT_METHODS, inputDate } from "@/lib/format";

/** Records a salary payment for the month shown in the summary above it. */
export function SalaryForm({ staffId, month, suggestedAmount }: { staffId: string; month: string; suggestedAmount: number }) {
  const [amount, setAmount] = useState(suggestedAmount > 0 ? String(suggestedAmount) : "");
  return (
    <ActionForm action={recordSalaryPaymentAction} successMessage="Salary payment recorded." className="grid gap-4 sm:grid-cols-2">
      {(err) => (
        <>
          <input type="hidden" name="staffId" value={staffId} />
          <input type="hidden" name="forMonth" value={month} />
          <Field label="Amount paid (₹)" name="amount" type="number" min={1} step={1} required value={amount} onChange={(e) => setAmount(e.target.value)} error={err.amount} />
          <Field label="Date paid" name="paidOn" type="date" defaultValue={inputDate(new Date())} error={err.paidOn} />
          <SelectField label="Method" name="method" defaultValue="BANK_TRANSFER">
            {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </SelectField>
          <Field label="Note (optional)" name="note" placeholder="e.g. UTR no., cheque no." className="sm:col-span-2" />
          <div className="flex justify-end sm:col-span-2">
            <SubmitButton>Record salary payment</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
