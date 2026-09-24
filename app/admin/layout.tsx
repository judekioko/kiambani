import { requireRole } from "@/lib/session";
import { DashboardShell, type NavItem } from "@/components/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/academic-years", label: "Academic Years & Terms" },
  { href: "/admin/classes", label: "Classes" },
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/grading-scales", label: "Grading Scales" },
  { href: "/admin/fees", label: "Fees" },
  { href: "/admin/announcements", label: "Announcements" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("ADMIN");

  return (
    <DashboardShell
      title="Admin"
      navItems={navItems}
      userName={session.name}
      userRole="Administrator"
    >
      {children}
    </DashboardShell>
  );
}
