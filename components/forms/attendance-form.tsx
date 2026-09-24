"use client";

import { useActionState } from "react";
import { markAttendance } from "@/lib/actions/attendance";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";

const statuses = ["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const;

export function AttendanceForm({
  classId,
  termId,
  date,
  students,
}: {
  classId: string;
  termId: string;
  date: string;
  students: { id: string; name: string; admissionNo: string; currentStatus: string }[];
}) {
  const [state, formAction, pending] = useActionState(markAttendance, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="termId" value={termId} />
      <input type="hidden" name="date" value={date} />
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <Table>
        <Thead>
          <Tr>
            <Th>Admission No.</Th>
            <Th>Student</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {students.map((student) => (
            <Tr key={student.id}>
              <Td>
                <input type="hidden" name="studentId" value={student.id} />
                {student.admissionNo}
              </Td>
              <Td>{student.name}</Td>
              <Td>
                <Select name={`status_${student.id}`} defaultValue={student.currentStatus}>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {students.length === 0 ? (
        <p className="text-sm text-slate-400">No students in this class</p>
      ) : (
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save attendance"}
        </Button>
      )}
    </form>
  );
}
