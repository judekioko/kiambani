import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getGuardianStudents } from "@/lib/guardian";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const statusTone = {
  PRESENT: "emerald",
  ABSENT: "rose",
  LATE: "amber",
  EXCUSED: "slate",
} as const;

export default async function ParentAttendancePage() {
  const session = await requireRole("PARENT");
  const students = await getGuardianStudents(session.userId);

  const recordsByStudent = await Promise.all(
    students.map((student) =>
      prisma.attendanceRecord.findMany({
        where: { studentId: student.id },
        orderBy: { date: "desc" },
        take: 20,
      })
    )
  );

  return (
    <div>
      <PageHeader title="Attendance" description="Recent attendance for your children." />
      <div className="space-y-6">
        {students.map((student, i) => (
          <Card key={student.id}>
            <CardHeader>
              <CardTitle>
                {student.firstName} {student.lastName} · {student.class?.name ?? "Unassigned"}
              </CardTitle>
            </CardHeader>
            <CardBody>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Status</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recordsByStudent[i].map((r) => (
                    <Tr key={r.id}>
                      <Td>{r.date.toLocaleDateString()}</Td>
                      <Td>
                        <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                      </Td>
                    </Tr>
                  ))}
                  {recordsByStudent[i].length === 0 ? (
                    <Tr>
                      <Td colSpan={2} className="text-center text-slate-400">
                        No attendance recorded yet
                      </Td>
                    </Tr>
                  ) : null}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        ))}
        {students.length === 0 ? (
          <p className="text-sm text-slate-500">No children linked to your account.</p>
        ) : null}
      </div>
    </div>
  );
}
