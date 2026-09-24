import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { FeeStructureForm } from "@/components/forms/fee-structure-form";

export default async function AdminFeesPage() {
  const [structures, classes, terms] = await Promise.all([
    prisma.feeStructure.findMany({
      include: { class: true, term: true, items: true },
      orderBy: { id: "desc" },
    }),
    prisma.schoolClass.findMany({ orderBy: { name: "asc" } }),
    prisma.term.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Fee Structures"
        description="Set what each class is charged per term. Invoices and payments are handled by the accountant."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <Thead>
              <Tr>
                <Th>Class</Th>
                <Th>Term</Th>
                <Th>Items</Th>
                <Th>Total</Th>
              </Tr>
            </Thead>
            <Tbody>
              {structures.map((s) => (
                <Tr key={s.id}>
                  <Td className="font-medium text-slate-900">{s.class.name}</Td>
                  <Td>{s.term.name}</Td>
                  <Td>{s.items.map((i) => i.name).join(", ")}</Td>
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
        <Card>
          <CardHeader>
            <CardTitle>New fee structure</CardTitle>
          </CardHeader>
          <CardBody>
            {classes.length === 0 || terms.length === 0 ? (
              <p className="text-sm text-slate-500">
                Create at least one class and term first.
              </p>
            ) : (
              <FeeStructureForm classes={classes} terms={terms} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
