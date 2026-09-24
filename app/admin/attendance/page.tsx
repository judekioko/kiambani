import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

const statusTone = {
  PRESENT: "emerald",
  ABSENT: "rose",
  LATE: "amber",
  EXCUSED: "slate",
} as const;

export default async function AdminAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string }>;
}) {
  const params = await searchParams;
  const classes = await prisma.schoolClass.findMany({ orderBy: { name: "asc" } });
  const classId = params.classId ?? classes[0]?.id;
  const date = params.date ?? todayIso();

  const records = classId
    ? await prisma.attendanceRecord.findMany({
        where: { classId, date: new Date(date) },
        include: { student: true },
        orderBy: [{ student: { lastName: "asc" } }],
      })
    : [];

  return (
    <div>
      <PageHeader title="Attendance overview" description="Review attendance by class and date." />
      <div className="space-y-6">
        <Card>
          <CardBody>
            <form className="flex flex-wrap items-end gap-3" method="get">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Class</label>
                <Select name="classId" defaultValue={classId}>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Date</label>
                <Input type="date" name="date" defaultValue={date} />
              </div>
              <Button type="submit" variant="secondary">
                Load
              </Button>
            </form>
          </CardBody>
        </Card>

        <Table>
          <Thead>
            <Tr>
              <Th>Student</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {records.map((record) => (
              <Tr key={record.id}>
                <Td>
                  {record.student.firstName} {record.student.lastName}
                </Td>
                <Td>
                  <Badge tone={statusTone[record.status]}>{record.status}</Badge>
                </Td>
              </Tr>
            ))}
            {records.length === 0 ? (
              <Tr>
                <Td colSpan={2} className="text-center text-slate-400">
                  No attendance recorded for this class and date
                </Td>
              </Tr>
            ) : null}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}
