"use client";

import { useState } from "react";
import type { ActionState } from "@/app/actions";
import { buttonClass } from "@/components/ui";
import { Modal } from "@/components/modal";
import { ClassForm } from "../class-form";

/** "Edit" button. Opens the class form in a pop-up. */
export function EditClassButton({
  action,
  teachers,
  defaults,
}: {
  action: (s: ActionState, fd: FormData) => Promise<ActionState>;
  teachers: { id: string; name: string }[];
  defaults: { name: string; section: string; room: string | null; classTeacherId: string | null };
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass("secondary")}>
        Edit
      </button>
      <Modal title="Edit class" open={open} onClose={() => setOpen(false)}>
        <ClassForm action={action} teachers={teachers} defaults={defaults} submitLabel="Save changes" />
      </Modal>
    </>
  );
}
