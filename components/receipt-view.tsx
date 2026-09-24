import { Card, CardBody } from "@/components/ui/card";
import { PrintButton } from "@/components/print-button";

export type ReceiptData = {
  receiptNo: string;
  issuedAt: Date;
  studentName: string;
  admissionNo: string;
  className: string;
  termName: string;
  amount: number;
  method: string;
  reference: string | null;
  totalAmount: number;
  totalPaidSoFar: number;
};

export function ReceiptView({ data }: { data: ReceiptData }) {
  const balance = data.totalAmount - data.totalPaidSoFar;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <Card className="print:border-none print:shadow-none">
        <CardBody>
          <div className="mb-4 text-center">
            <h1 className="text-lg font-semibold text-slate-900">Kiambani School</h1>
            <p className="text-sm text-slate-500">Official Payment Receipt</p>
          </div>
          <div className="mb-4 flex items-center justify-between border-y border-slate-200 py-2 text-sm">
            <span className="text-slate-500">Receipt No.</span>
            <span className="font-mono font-medium text-slate-900">{data.receiptNo}</span>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Date</dt>
              <dd>{data.issuedAt.toLocaleString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Student</dt>
              <dd>{data.studentName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Admission No.</dt>
              <dd>{data.admissionNo}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Class</dt>
              <dd>{data.className}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Term</dt>
              <dd>{data.termName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Method</dt>
              <dd>{data.method}</dd>
            </div>
            {data.reference ? (
              <div className="flex justify-between">
                <dt className="text-slate-500">Reference</dt>
                <dd>{data.reference}</dd>
              </div>
            ) : null}
          </dl>
          <div className="mt-4 space-y-1 border-t border-slate-200 pt-3 text-sm">
            <div className="flex justify-between text-base font-semibold text-emerald-700">
              <span>Amount paid</span>
              <span>{data.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Term total</span>
              <span>{data.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Remaining balance</span>
              <span>{balance.toLocaleString()}</span>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Verify this receipt at /receipts/verify/{data.receiptNo}
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
