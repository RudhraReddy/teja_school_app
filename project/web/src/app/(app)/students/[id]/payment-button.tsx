"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui";
import { Modal } from "@/components/modal";
import { PaymentForm } from "./payment-form";

/** "Payment" button. Opens the record-a-payment form in a pop-up. */
export function PaymentButton({ studentId, items }: { studentId: string; items: { id: string; label: string; balance: number }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass("secondary")}>
        Payment
      </button>
      <Modal title="Record a payment" open={open} onClose={() => setOpen(false)}>
        <PaymentForm studentId={studentId} items={items} />
      </Modal>
    </>
  );
}
