"use client";

import { useActionState } from "react";
import { saveMarks } from "@/lib/actions/grading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";

export function MarksForm({
  assessmentId,
  maxScore,
  students,
}: {
  assessmentId: string;
  maxScore: number;
  students: { id: string; name: string; admissionNo: string; score: number | null; remarks: string | null }[];
}) {
  const [state, formAction, pending] = useActionState(saveMarks, {});

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="assessmentId" value={assessmentId} />
      {state?.error ? <Alert variant="error">{state.error}</Alert> : null}
      {state?.success ? <Alert variant="success">{state.success}</Alert> : null}
      <Table>
        <Thead>
          <Tr>
            <Th>Admission No.</Th>
            <Th>Student</Th>
            <Th>Score (/ {maxScore})</Th>
            <Th>Remarks</Th>
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
                <Input
                  type="number"
                  step="0.5"
                  min={0}
                  max={maxScore}
                  name={`score_${student.id}`}
                  defaultValue={student.score ?? ""}
                  className="w-24"
                />
              </Td>
              <Td>
                <Input
                  name={`remarks_${student.id}`}
                  defaultValue={student.remarks ?? ""}
                  placeholder="optional"
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {students.length === 0 ? (
        <p className="text-sm text-slate-400">No students in this class</p>
      ) : (
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : "Save marks"}
        </Button>
      )}
    </form>
  );
}
