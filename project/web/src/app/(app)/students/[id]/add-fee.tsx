"use client";

import { useState } from "react";
import { addFeeAction } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Field, buttonClass } from "@/components/ui";

/** The "+ Fee" button. Opens a small form to add one fee (transport, tour, books, ...) to this student. */
export function AddFeeButton({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={buttonClass()}>
        + Fee
      </button>
    );
  }

  return (
    <div className="w-full">
      <ActionForm action={addFeeAction.bind(null, studentId)} successMessage="Fee added." className="grid gap-3 sm:grid-cols-[1fr_120px_150px_auto] sm:items-end">
        {(err) => (
          <>
            <Field label="Fee" name="name" required placeholder="Transport, Class trip, Books" error={err.name} />
            <Field label="Amount (₹)" name="amount" type="number" min={1} step={1} required error={err.amount} />
            <Field label="Due date" name="dueDate" type="date" error={err.dueDate} />
            <div className="flex gap-2">
              <SubmitButton>Add fee</SubmitButton>
              <button type="button" onClick={() => setOpen(false)} className={buttonClass("secondary")}>
                Close
              </button>
            </div>
          </>
        )}
      </ActionForm>
    </div>
  );
}
