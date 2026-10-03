import { getPublicReceiptByNo } from "@/lib/receipt";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { COLLEGE_NAME } from "@/lib/brand";

export default async function VerifyReceiptPage({
  params,
}: {
  params: Promise<{ receiptNo: string }>;
}) {
  const { receiptNo } = await params;
  const receipt = await getPublicReceiptByNo(receiptNo);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Receipt Verification</CardTitle>
          <p className="mt-1 text-sm text-slate-500">{COLLEGE_NAME}</p>
        </CardHeader>
        <CardBody>
          {receipt ? (
            <div className="space-y-3">
              <Alert variant="success">This receipt is valid.</Alert>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Receipt No.</dt>
                  <dd className="font-mono font-medium">{receipt.receiptNo}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Date</dt>
                  <dd>{receipt.issuedAt.toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Student</dt>
                  <dd>{receipt.studentName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Course</dt>
                  <dd>{receipt.className}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Amount</dt>
                  <dd>{receipt.amount.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Method</dt>
                  <dd>{receipt.method}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <Alert variant="error">
              No receipt found with number &quot;{receiptNo}&quot;. It may be invalid or
              mistyped.
            </Alert>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
