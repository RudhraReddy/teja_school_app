import { requirePageUser } from "@/lib/auth";
import { TopBar } from "@/components/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();
  const isAdmin = user.role === "ADMIN";
  const links = [
    { href: "/classes", label: "Classes" },
    { href: "/students", label: "Students" },
    ...(isAdmin ? [{ href: "/transitions", label: "Transitions" }, { href: "/loans", label: "Loans" }] : []),
    ...(isAdmin ? [{ href: "/staff", label: "Staff" }] : []),
    ...(isAdmin ? [{ href: "/accounts", label: "Accounts" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
    { href: "/transport", label: "Transport" },
  ];
  return (
    <div className="min-h-screen">
      <TopBar links={links} userName={user.name} roleLabel={isAdmin ? "Administrator" : "Teacher"} />
      <main className="mx-auto w-full max-w-[1280px] px-6 py-12 md:px-[72px] md:py-14">{children}</main>
      <footer className="mx-auto max-w-[1280px] px-6 pb-12 text-center text-[10px] font-medium uppercase tracking-[0.3em] text-muted md:px-[72px]">
        Teja International High School
      </footer>
    </div>
  );
}
