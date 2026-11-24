"use client";

import { useState } from "react";
import { recordPaymentAction } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Field, SelectField } from "@/components/ui";
import { PAYMENT_METHODS, inputDate } from "@/lib/format";

export function PaymentForm({ studentId, items }: { studentId: string; items: { id: string; label: string; balance: number }[] }) {
  const firstDue = items.find((i) => i.balance > 0);
  const [amount, setAmount] = useState(firstDue ? String(firstDue.balance) : "");
  return (
    <ActionForm action={recordPaymentAction} successMessage="Payment recorded." className="grid gap-4 sm:grid-cols-2">
      {(err) => (
        <>
          <input type="hidden" name="studentId" value={studentId} />
          <SelectField
            label="Paying for"
            name="feeItemId"
            defaultValue={firstDue?.id ?? ""}
            onChange={(e) => {
              const item = items.find((i) => i.id === e.target.value);
              if (item) setAmount(String(item.balance));
            }}
          >
            <option value="">General / advance</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.label}
              </option>
            ))}
          </SelectField>
          <Field label="Amount (₹)" name="amount" type="number" min={1} step={1} required value={amount} onChange={(e) => setAmount(e.target.value)} error={err.amount} />
          <SelectField label="Method" name="method" defaultValue="CASH">
            {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </SelectField>
          <Field label="Date paid" name="paidOn" type="date" defaultValue={inputDate(new Date())} />
          <Field label="Note (optional)" name="note" placeholder="e.g. UPI ref, cheque no." className="sm:col-span-2" />
          <div className="flex justify-end sm:col-span-2">
            <SubmitButton>Record payment</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
