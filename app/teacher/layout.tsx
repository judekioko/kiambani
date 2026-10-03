import { requireRole } from "@/lib/session";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/attendance", label: "Attendance" },
  { href: "/teacher/grades", label: "Results" },
  { href: "/teacher/announcements", label: "Announcements" },
  { href: "/teacher/events", label: "Events" },
];

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("TEACHER");

  return (
    <DashboardShell
      title="Trainer"
      navItems={navItems}
      userName={session.name}
      userRole="Trainer"
    >
      {children}
    </DashboardShell>
  );
}
