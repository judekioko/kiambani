import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AttendanceForm } from "@/components/forms/attendance-form";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function TeacherAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; date?: string }>;
}) {
  const session = await requireRole("TEACHER");
  const params = await searchParams;

  const classes = await prisma.schoolClass.findMany({
    where: { classTeacherId: session.userId },
    orderBy: { name: "asc" },
  });

  const currentTerm = await prisma.term.findFirst({ where: { isCurrent: true } });
  const classId = params.classId ?? classes[0]?.id;
  const date = params.date ?? todayIso();

  const students = classId
    ? await prisma.student.findMany({
        where: { classId, status: "ACTIVE" },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      })
    : [];

  const existingRecords = classId
    ? await prisma.attendanceRecord.findMany({
        where: { classId, date: new Date(date) },
      })
    : [];
  const statusByStudent = new Map(existingRecords.map((r) => [r.studentId, r.status]));

  return (
    <div>
      <PageHeader title="Attendance" description="Mark daily attendance for your course." />

      {classes.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-sm text-slate-500">
              You are not assigned as a course coordinator for any course yet.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardBody>
              <form className="flex flex-wrap items-end gap-3" method="get">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Course</label>
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

          {!currentTerm ? (
            <Card>
              <CardBody>
                <p className="text-sm text-slate-500">
                  No current semester is set. Ask an administrator to mark a semester as current.
                </p>
              </CardBody>
            </Card>
          ) : classId ? (
            <Card>
              <CardBody>
                <AttendanceForm
                  classId={classId}
                  termId={currentTerm.id}
                  date={date}
                  students={students.map((s) => ({
                    id: s.id,
                    name: `${s.firstName} ${s.lastName}`,
                    admissionNo: s.admissionNo,
                    currentStatus: statusByStudent.get(s.id) ?? "PRESENT",
                  }))}
                />
              </CardBody>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
