import { requireRole } from "@/lib/session";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/parent", label: "Dashboard" },
  { href: "/parent/attendance", label: "Attendance" },
  { href: "/parent/grades", label: "Grades" },
  { href: "/parent/fees", label: "Fees" },
  { href: "/parent/announcements", label: "Announcements" },
];

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("PARENT");

  return (
    <DashboardShell
      title="Parent"
      navItems={navItems}
      userName={session.name}
      userRole="Parent"
    >
      {children}
    </DashboardShell>
  );
}
