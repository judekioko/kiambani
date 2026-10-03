import { requireRole } from "@/lib/session";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/attendance", label: "Attendance" },
  { href: "/student/grades", label: "Results" },
  { href: "/student/fees", label: "Fees" },
  { href: "/student/announcements", label: "Announcements" },
  { href: "/student/events", label: "Events" },
];

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("STUDENT");

  return (
    <DashboardShell
      title="Student"
      navItems={navItems}
      userName={session.name}
      userRole="Student"
    >
      {children}
    </DashboardShell>
  );
}
