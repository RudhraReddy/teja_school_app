"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Menu links. When `collapsed` (desktop only), each link shows just its first letter. Mobile always shows full labels. */
export function NavLinks({ links, collapsed = false }: { links: { href: string; label: string }[]; collapsed?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0 md:px-3">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            title={l.label}
            aria-label={l.label}
            className={`whitespace-nowrap rounded-lg text-sm font-medium transition ${
              collapsed ? "px-3 py-2 md:flex md:justify-center md:px-0" : "px-3 py-2"
            } ${active ? "bg-brand text-white" : "text-muted hover:bg-subtle hover:text-ink"}`}
          >
            <span className={collapsed ? "md:hidden" : ""}>{l.label}</span>
            <span className={collapsed ? "hidden h-7 w-7 items-center justify-center rounded-md bg-subtle text-xs font-semibold text-ink md:inline-flex" : "hidden"}>
              {l.label.charAt(0)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
