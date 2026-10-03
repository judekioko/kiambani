import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { COLLEGE_NAME, COLLEGE_SHORT_NAME } from "@/lib/brand";

export type NavItem = { href: string; label: string };

export function DashboardShell({
  title,
  navItems,
  userName,
  userRole,
  children,
}: {
  title: string;
  navItems: NavItem[];
  userName: string;
  userRole: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col border-r border-slate-200 bg-white sm:flex print:hidden">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-sm font-semibold leading-snug text-slate-900">{COLLEGE_NAME}</p>
          <p className="text-xs text-slate-500">{title}</p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 print:hidden">
          <p className="text-sm font-medium text-slate-700">
            <span className="text-slate-400 sm:hidden">{COLLEGE_SHORT_NAME} · </span>
            Hi, {userName.split(" ")[0]}
          </p>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500">{userRole}</p>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="secondary" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
