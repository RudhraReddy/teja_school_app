"use client";

import { useState } from "react";
import { createClassAction } from "@/app/actions";
import { buttonClass } from "@/components/ui";
import { Modal } from "@/components/modal";
import { ClassForm } from "./class-form";

/** "New Class" button. Opens the class form in a pop-up. */
export function NewClassButton({ teachers }: { teachers: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass()}>
        New Class
      </button>
      <Modal title="New class" open={open} onClose={() => setOpen(false)}>
        <ClassForm action={createClassAction} teachers={teachers} submitLabel="Create class" />
      </Modal>
    </>
  );
}
