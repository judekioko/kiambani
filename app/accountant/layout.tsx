import { requireRole } from "@/lib/session";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/accountant", label: "Dashboard" },
  { href: "/accountant/fee-structures", label: "Fee Structures" },
  { href: "/accountant/invoices", label: "Invoices" },
  { href: "/accountant/payments", label: "Payments" },
  { href: "/accountant/announcements", label: "Announcements" },
];

export default async function AccountantLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("ACCOUNTANT");

  return (
    <DashboardShell
      title="Accountant"
      navItems={navItems}
      userName={session.name}
      userRole="Accountant"
    >
      {children}
    </DashboardShell>
  );
}
