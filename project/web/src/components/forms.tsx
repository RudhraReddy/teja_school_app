"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/app/actions";
import { buttonClass } from "./ui";

export function SubmitButton({ children, variant = "primary" }: { children: ReactNode; variant?: "primary" | "secondary" | "danger" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass(variant)}>
      {pending ? "Saving…" : children}
    </button>
  );
}

type Action = (state: ActionState, fd: FormData) => Promise<ActionState>;

/** Form bound to a server action; shows errors, resets on success. Children receive field errors. */
export function ActionForm({
  action,
  children,
  className = "space-y-4",
  resetOnSuccess = true,
  successMessage,
}: {
  action: Action;
  children: (fieldErrors: Record<string, string[] | undefined>) => ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  successMessage?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={className}>
      {state?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}
      {state?.ok && successMessage && (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          {successMessage}
        </p>
      )}
      {children(state?.fieldErrors ?? {})}
    </form>
  );
}

/** A small button that runs a server action after an optional confirm(). */
export function ConfirmButton({
  action,
  confirm: message,
  children,
  variant = "danger",
}: {
  action: () => Promise<ActionState>;
  confirm?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <form
      action={async () => {
        const res = await action();
        if (res?.error) alert(res.error);
      }}
      onSubmit={(e) => {
        if (message && !window.confirm(message)) e.preventDefault();
      }}
    >
      <SubmitButton variant={variant}>{children}</SubmitButton>
    </form>
  );
}
