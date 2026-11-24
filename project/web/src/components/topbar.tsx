import Link from "next/link";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";

/** Top bar: logo and school name on the left, navigation, and the signed-in user on the right. */
export function TopBar({ links, userName, roleLabel }: { links: { href: string; label: string }[]; userName: string; roleLabel: string }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-x-10 gap-y-6 px-6 py-7 md:px-[72px]">
        <Link href="/students" className="flex items-center gap-4">
          <Logo className="h-14 w-14" />
          <div className="leading-tight">
            <div className="text-base font-medium tracking-wide text-ink">Teja International</div>
            <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.25em] text-muted">High School</div>
          </div>
        </Link>
        <NavLinks links={links} />
        <div className="text-right">
          <div className="text-sm text-ink">{userName}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted">{roleLabel}</div>
        </div>
      </div>
    </header>
  );
}
