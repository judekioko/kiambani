import { notFound } from "next/navigation";
import { getReceiptById } from "@/lib/receipt";
import { ReceiptView } from "@/components/receipt-view";

export default async function AccountantReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const receipt = await getReceiptById(id);
  if (!receipt) notFound();

  return <ReceiptView data={receipt.data} />;
}
