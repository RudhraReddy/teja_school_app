"use client";

import { useRef, type ReactNode } from "react";

/**
 * A GET form that applies itself: choosing a dropdown or date applies at once,
 * and typing in a search box applies after a short pause. No Apply button needed.
 */
export function AutoFilterForm({ children, className = "" }: { children: ReactNode; className?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const submitLater = (delay: number) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => formRef.current?.requestSubmit(), delay);
  };

  const isTyping = (target: EventTarget) => target instanceof HTMLInputElement && (target.type === "text" || target.type === "search");

  return (
    <form
      ref={formRef}
      method="get"
      className={className}
      onInput={(e) => {
        if (isTyping(e.target)) submitLater(400);
      }}
      onChange={(e) => {
        if (!isTyping(e.target)) submitLater(0);
      }}
      onSubmit={() => clearTimeout(timer.current)}
    >
      {children}
    </form>
  );
}
