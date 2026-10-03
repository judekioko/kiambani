import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaffForm } from "@/components/forms/staff-form";
import { toggleStaffActive } from "@/lib/actions/staff";

export default async function StaffPage() {
  const staff = await prisma.user.findMany({
    where: { role: { in: ["TEACHER", "ACCOUNTANT"] } },
    include: { staffProfile: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="Staff" description="Trainers and accountants at the college." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Role</Th>
                <Th>Staff No.</Th>
                <Th>Position</Th>
                <Th>Status</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {staff.map((member) => (
                <Tr key={member.id}>
                  <Td className="font-medium text-slate-900">
                    {member.name}
                    <div className="text-xs text-slate-400">{member.email}</div>
                  </Td>
                  <Td>{member.role}</Td>
                  <Td>{member.staffProfile?.staffNo}</Td>
                  <Td>{member.staffProfile?.position}</Td>
                  <Td>
                    {member.active ? (
                      <Badge tone="emerald">Active</Badge>
                    ) : (
                      <Badge tone="rose">Inactive</Badge>
                    )}
                  </Td>
                  <Td>
                    <form
                      action={async () => {
                        "use server";
                        await toggleStaffActive(member.id, !member.active);
                      }}
                    >
                      <Button type="submit" size="sm" variant="secondary">
                        {member.active ? "Deactivate" : "Activate"}
                      </Button>
                    </form>
                  </Td>
                </Tr>
              ))}
              {staff.length === 0 ? (
                <Tr>
                  <Td colSpan={6} className="text-center text-slate-400">
                    No staff yet
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          </Table>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>New staff member</CardTitle>
          </CardHeader>
          <CardBody>
            <StaffForm />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
