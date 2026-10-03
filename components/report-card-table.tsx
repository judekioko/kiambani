import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import type { ReportCardRow } from "@/lib/report-card";

export function ReportCardTable({
  rows,
  overallPercent,
}: {
  rows: ReportCardRow[];
  overallPercent: number;
}) {
  return (
    <div className="space-y-3">
      <Table>
        <Thead>
          <Tr>
            <Th>Code</Th>
            <Th>Unit</Th>
            <Th>Score</Th>
            <Th>Percent</Th>
            <Th>Grade</Th>
            <Th>Comment</Th>
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row) => (
            <Tr key={row.subject}>
              <Td className="text-slate-500">{row.code}</Td>
              <Td className="font-medium text-slate-900">{row.subject}</Td>
              <Td>
                {row.totalScore} / {row.totalMax}
              </Td>
              <Td>{row.percent}%</Td>
              <Td>{row.letter ?? "-"}</Td>
              <Td>{row.comment ?? ""}</Td>
            </Tr>
          ))}
          {rows.length === 0 ? (
            <Tr>
              <Td colSpan={6} className="text-center text-slate-400">
                No marks recorded for this semester
              </Td>
            </Tr>
          ) : null}
        </Tbody>
      </Table>
      {rows.length > 0 ? (
        <p className="text-sm font-medium text-slate-700">
          Semester average: {overallPercent}%
        </p>
      ) : null}
    </div>
  );
}
