"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Top navigation links. The current page is underlined. */
export function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-x-7 gap-y-3" aria-label="Main">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap pb-1 text-[11px] font-medium uppercase tracking-[0.2em] transition ${
              active ? "border-b border-ink text-ink" : "border-b border-transparent text-muted hover:text-ink"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
