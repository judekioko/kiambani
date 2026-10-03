import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { getMyStudents } from "@/lib/my-student";
import { getReceiptById } from "@/lib/receipt";
import { ReceiptView } from "@/components/receipt-view";

export default async function StudentReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole("STUDENT");
  const { id } = await params;
  const receipt = await getReceiptById(id);
  if (!receipt) notFound();

  const myStudents = await getMyStudents(session.userId);
  const owns = myStudents.some((s) => s.id === receipt.studentId);
  if (!owns) notFound();

  return <ReceiptView data={receipt.data} />;
}
