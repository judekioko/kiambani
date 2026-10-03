import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { feeLabel } from "@/lib/fee-labels";

export default async function AccountantFeeStructuresPage() {
  const structures = await prisma.feeStructure.findMany({
    include: { class: true, term: true, items: true },
    orderBy: { id: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Fee Structures"
        description="Per-course fee structures set by the administrator."
      />
      <Table>
        <Thead>
          <Tr>
            <Th>Course</Th>
            <Th>Semester</Th>
            <Th>Items</Th>
            <Th>Total</Th>
          </Tr>
        </Thead>
        <Tbody>
          {structures.map((s) => (
            <Tr key={s.id}>
              <Td className="font-medium text-slate-900">{s.class.name}</Td>
              <Td>{s.term.name}</Td>
              <Td>{s.items.map((i) => feeLabel(i.name)).join(", ")}</Td>
              <Td>{s.items.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</Td>
            </Tr>
          ))}
          {structures.length === 0 ? (
            <Tr>
              <Td colSpan={4} className="text-center text-slate-400">
                No fee structures yet
              </Td>
            </Tr>
          ) : null}
        </Tbody>
      </Table>
    </div>
  );
}
