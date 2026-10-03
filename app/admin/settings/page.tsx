import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import { Card, CardBody } from "@/components/ui/card";
import { CollegeSettingsForm } from "@/components/forms/college-settings-form";

export default async function AdminSettingsPage() {
  const college = await prisma.school.findFirst();

  return (
    <div>
      <PageHeader
        title="College Settings"
        description="Bank details shown to students for paying fees, and the college's contact information."
      />
      <Card className="max-w-3xl">
        <CardBody>
          <CollegeSettingsForm
            settings={{
              address: college?.address ?? null,
              phone: college?.phone ?? null,
              email: college?.email ?? null,
              bankName: college?.bankName ?? null,
              bankAccountName: college?.bankAccountName ?? null,
              bankAccountNumber: college?.bankAccountNumber ?? null,
              bankBranch: college?.bankBranch ?? null,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
