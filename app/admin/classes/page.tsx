import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { ClassForm } from "@/components/forms/class-form";

export default async function ClassesPage() {
  const [classes, academicYears, teachers] = await Promise.all([
    prisma.schoolClass.findMany({
      include: {
        academicYear: true,
        classTeacher: true,
        _count: { select: { students: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.academicYear.findMany({ orderBy: { startDate: "desc" } }),
    prisma.user.findMany({ where: { role: "TEACHER" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader title="Courses" description="Courses offered for the current academic year." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Table>
            <Thead>
              <Tr>
                <Th>Course</Th>
                <Th>Academic Year</Th>
                <Th>Course Coordinator</Th>
                <Th>Students</Th>
              </Tr>
            </Thead>
            <Tbody>
              {classes.map((cls) => (
                <Tr key={cls.id}>
                  <Td>
                    <Link
                      href={`/admin/classes/${cls.id}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      {cls.name}
                    </Link>
                  </Td>
                  <Td>{cls.academicYear.name}</Td>
                  <Td>{cls.classTeacher?.name ?? "Unassigned"}</Td>
                  <Td>{cls._count.students}</Td>
                </Tr>
              ))}
              {classes.length === 0 ? (
                <Tr>
                  <Td colSpan={4} className="text-center text-slate-400">
                    No courses yet
                  </Td>
                </Tr>
              ) : null}
            </Tbody>
          </Table>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>New course</CardTitle>
          </CardHeader>
          <CardBody>
            {academicYears.length === 0 ? (
              <p className="text-sm text-slate-500">
                Create an academic year first before adding courses.
              </p>
            ) : (
              <ClassForm academicYears={academicYears} teachers={teachers} />
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
