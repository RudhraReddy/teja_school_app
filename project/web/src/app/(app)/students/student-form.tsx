"use client";

import Link from "next/link";
import { useState } from "react";
import type { ActionState } from "@/app/actions";
import { ActionForm, SubmitButton } from "@/components/forms";
import { Field, SelectField, TextAreaField, buttonClass, inputClass } from "@/components/ui";
import { inputDate } from "@/lib/format";

export interface StudentDefaults {
  admissionNo?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date | string | null;
  gender?: string | null;
  guardianName?: string | null;
  guardianPhones?: string[];
  address?: string | null;
  notes?: string | null;
  status?: string;
  classId?: string | null;
}

type FeeRow = { name: string; amount: string; dueDate: string };

/**
 * Add / edit student form.
 * - Parent phone numbers: one or more. "Add another number" appears once the last one is filled in.
 * - Fees (create only): optional rows entered on the same form, e.g. Transport, Class trip, Books.
 */
export function StudentForm({
  action,
  classes,
  defaults = {},
  cancelHref,
  showFees = false,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  classes: { id: string; label: string }[];
  defaults?: StudentDefaults;
  cancelHref: string;
  showFees?: boolean;
}) {
  const [phones, setPhones] = useState<string[]>(defaults.guardianPhones?.length ? defaults.guardianPhones : [""]);
  const [fees, setFees] = useState<FeeRow[]>([]);

  const lastPhoneFilled = phones[phones.length - 1]?.trim() !== "";

  return (
    <ActionForm action={action} resetOnSuccess={false} className="grid gap-4 sm:grid-cols-2">
      {(err) => (
        <>
          <Field label="First name" name="firstName" defaultValue={defaults.firstName} required error={err.firstName} />
          <Field label="Last name" name="lastName" defaultValue={defaults.lastName} required error={err.lastName} />
          <Field label="Admission number" name="admissionNo" defaultValue={defaults.admissionNo} required error={err.admissionNo} />
          <SelectField label="Class" name="classId" defaultValue={defaults.classId ?? ""} error={err.classId}>
            <option value="">Unassigned</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </SelectField>
          <Field label="Parent / guardian name" name="guardianName" defaultValue={defaults.guardianName ?? ""} className="sm:col-span-2" />

          <div className="sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-ink">Parent phone numbers</span>
            <div className="space-y-2">
              {phones.map((p, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    name="guardianPhone"
                    type="tel"
                    value={p}
                    onChange={(e) => setPhones(phones.map((x, j) => (j === i ? e.target.value : x)))}
                    placeholder={i === 0 ? "Primary number" : "Another number"}
                    className={inputClass}
                  />
                  {phones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPhones(phones.filter((_, j) => j !== i))}
                      className="shrink-0 rounded-lg border border-line px-3 text-sm text-muted hover:bg-subtle"
                      aria-label="Remove this number"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
            {lastPhoneFilled ? (
              <button type="button" onClick={() => setPhones([...phones, ""])} className="mt-2 text-sm text-ink hover:underline">
                + Add another phone number
              </button>
            ) : (
              <p className="mt-2 text-xs text-muted">Fill in a number to add another.</p>
            )}
            {err.guardianPhones?.[0] && <span className="mt-1 block text-xs text-red-600">{err.guardianPhones[0]}</span>}
          </div>

          <Field label="Date of birth" name="dateOfBirth" type="date" defaultValue={inputDate(defaults.dateOfBirth)} error={err.dateOfBirth} />
          <SelectField label="Gender" name="gender" defaultValue={defaults.gender ?? ""}>
            <option value="">Not specified</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </SelectField>
          <TextAreaField label="Address (optional)" name="address" rows={2} defaultValue={defaults.address ?? ""} className="sm:col-span-2" />
          <TextAreaField label="Additional notes (optional)" name="notes" rows={3} defaultValue={defaults.notes ?? ""} placeholder="Anything the office should know" className="sm:col-span-2" />

          {!showFees && (
            <SelectField label="Status" name="status" defaultValue={defaults.status ?? "ACTIVE"} className="sm:col-span-2">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive (left school)</option>
            </SelectField>
          )}

          {showFees && (
            <div className="sm:col-span-2 rounded-lg border border-line p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Fees (optional)</h3>
                  <p className="text-xs text-muted">Add fees now, or later from the student&apos;s page.</p>
                </div>
                <button type="button" onClick={() => setFees([...fees, { name: "", amount: "", dueDate: "" }])} className={buttonClass("secondary")}>
                  + Fee
                </button>
              </div>
              {fees.length === 0 ? (
                <p className="text-sm text-muted">No fees added.</p>
              ) : (
                <div className="space-y-3">
                  {fees.map((f, i) => (
                    <div key={i} className="grid gap-2 sm:grid-cols-[1fr_120px_150px_auto]">
                      <input
                        name="feeName"
                        value={f.name}
                        placeholder="e.g. Transport, Class trip, Books"
                        onChange={(e) => setFees(fees.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                        className={inputClass}
                      />
                      <input
                        name="feeAmount"
                        type="number"
                        min={1}
                        step={1}
                        placeholder="₹"
                        value={f.amount}
                        onChange={(e) => setFees(fees.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))}
                        className={inputClass}
                      />
                      <input
                        name="feeDueDate"
                        type="date"
                        value={f.dueDate}
                        onChange={(e) => setFees(fees.map((x, j) => (j === i ? { ...x, dueDate: e.target.value } : x)))}
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setFees(fees.filter((_, j) => j !== i))}
                        className="rounded-lg border border-line px-3 text-sm text-muted hover:bg-subtle"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-end justify-end gap-2 sm:col-span-2">
            <Link href={cancelHref} className={buttonClass("secondary")}>
              Cancel
            </Link>
            <SubmitButton>Save student</SubmitButton>
          </div>
        </>
      )}
    </ActionForm>
  );
}
