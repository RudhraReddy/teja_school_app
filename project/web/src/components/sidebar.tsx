"use client";

import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";

const STORAGE_KEY = "teja-sidebar-collapsed";

/** Left menu. On desktop it can collapse to a narrow strip of letter tiles; on mobile it stays as a top bar. */
export function Sidebar({ links, userName, roleLabel }: { links: { href: string; label: string }[]; userName: string; roleLabel: string }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      // Storage can be blocked; the menu then simply starts expanded.
    }
  }, []);

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Ignore: the choice just won't be remembered.
      }
      return next;
    });
  };

  return (
    <aside
      className={`border-b border-line bg-surface transition-[width] duration-200 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-r md:border-b-0 ${
        collapsed ? "md:w-16" : "md:w-60"
      }`}
    >
      <div className={`flex items-center gap-3 px-4 py-4 md:py-5 ${collapsed ? "md:justify-center md:px-2" : "md:px-4"}`}>
        <Logo />
        {!collapsed && (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold">Teja International</p>
            <p className="text-xs text-muted">High School</p>
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
          title={collapsed ? "Expand menu" : "Collapse menu"}
          className={`hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-subtle hover:text-ink md:inline-flex ${
            collapsed ? "md:absolute md:left-[4.5rem] md:top-5 md:h-6 md:w-6 md:border md:border-line md:bg-surface" : "ml-auto"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            {collapsed ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
          </svg>
        </button>
      </div>

      <NavLinks links={links} collapsed={collapsed} />

      <div className={`hidden border-t border-line md:mt-auto md:block ${collapsed ? "p-2 text-center" : "p-4"}`}>
        {collapsed ? (
          <p className="text-xs font-semibold text-muted" title={userName}>
            {userName.charAt(0)}
          </p>
        ) : (
          <>
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted">{roleLabel}</p>
          </>
        )}
      </div>
    </aside>
  );
}
