"use client";

import { useState, type ReactNode } from "react";
import { buttonClass } from "@/components/ui";
import { Modal } from "@/components/modal";

/** "Details" button. Opens the student's details in a pop-up. */
export function StudentDetailsButton({ items }: { items: [string, ReactNode][] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass("secondary")}>
        Details
      </button>
      <Modal title="Student details" open={open} onClose={() => setOpen(false)}>
        <dl className="divide-y divide-line text-sm">
          {items.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[9rem_1fr] gap-3 py-2.5">
              <dt className="text-muted">{k}</dt>
              <dd className="text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </Modal>
    </>
  );
}
