import { requirePageUser } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();
  const isAdmin = user.role === "ADMIN";
  const links = [
    { href: "/classes", label: "Classes" },
    { href: "/students", label: "Students" },
    ...(isAdmin ? [{ href: "/transitions", label: "Transitions" }, { href: "/loans", label: "Loans" }] : []),
    ...(isAdmin ? [{ href: "/staff", label: "Staff" }] : []),
    ...(isAdmin ? [{ href: "/accounts", label: "Accounts" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin overview" }] : []),
    { href: "/transport", label: "Transport" },
  ];
  return (
    <div className="min-h-screen md:flex">
      <Sidebar links={links} userName={user.name} roleLabel={isAdmin ? "Administrator" : "Teacher"} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
