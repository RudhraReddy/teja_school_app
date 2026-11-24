import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/* Luxury look: square edges, hairline rules, letter-spaced uppercase labels, light display type. */

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted">Teja International</p>
        <h1 className="mt-2 text-4xl font-light tracking-tight text-ink md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 text-sm font-light text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ title, action, children, className = "" }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  // A card without a title is just content: no box, like the mockup's list pages.
  if (!title && !action) return <section className={className}>{children}</section>;
  return (
    <section className={`border border-line bg-surface p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-2 border-b border-line pb-4">
          {title && <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-ink">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

const btn = {
  primary: "border border-ink bg-transparent text-ink hover:bg-ink hover:text-bg",
  secondary: "border border-line bg-transparent text-ink hover:border-ink",
  danger: "border border-red-900 bg-transparent text-red-300 hover:bg-red-950",
};
export const buttonClass = (variant: keyof typeof btn = "primary") =>
  `inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.2em] transition disabled:opacity-50 ${btn[variant]}`;

export function LinkButton({ href, children, variant = "primary" }: { href: string; children: ReactNode; variant?: keyof typeof btn }) {
  return (
    <Link href={href} className={buttonClass(variant)}>
      {children}
    </Link>
  );
}

/* Underline-only fields, as in the mockup. */
export const inputClass =
  "w-full border-0 border-b border-line bg-transparent px-0 py-2.5 text-sm font-light text-ink placeholder:text-muted focus:border-ink focus:outline-none";

export function Field({ label, name, error, className = "", ...props }: { label: string; error?: string[] } & ComponentProps<"input">) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{label}</span>
      <input name={name} className={inputClass} {...props} />
      {error?.[0] && <span className="mt-1 block text-xs text-red-400">{error[0]}</span>}
    </label>
  );
}

export function SelectField({ label, children, error, className = "", ...props }: { label: string; error?: string[] } & ComponentProps<"select">) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{label}</span>
      <select className={inputClass} {...props}>
        {children}
      </select>
      {error?.[0] && <span className="mt-1 block text-xs text-red-400">{error[0]}</span>}
    </label>
  );
}

export function TextAreaField({ label, error, className = "", ...props }: { label: string; error?: string[] } & ComponentProps<"textarea">) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{label}</span>
      <textarea className={inputClass} {...props} />
      {error?.[0] && <span className="mt-1 block text-xs text-red-400">{error[0]}</span>}
    </label>
  );
}

const badgeTones = {
  green: "border-green-800 text-green-300",
  amber: "border-amber-800 text-amber-300",
  red: "border-red-800 text-red-300",
  gray: "border-line text-muted",
  blue: "border-blue-800 text-blue-300",
};
export function Badge({ tone = "gray", children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return (
    <span className={`inline-flex border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] ${badgeTones[tone]}`}>{children}</span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="border border-dashed border-line p-8 text-center text-sm font-light text-muted">{children}</p>;
}

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div className="-mx-6 overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm font-light">
        <thead className="border-b border-line text-[10px] font-medium uppercase tracking-[0.2em] text-muted">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-6 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export const td = "px-6 py-4 align-middle";
