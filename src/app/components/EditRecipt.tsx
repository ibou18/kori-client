import { useGetReceipt } from "../data/hooks";
import { ReceiptForm } from "./form/ReceiptForm";

// Pour la création
export function CreateReceiptPage() {
  return <ReceiptForm />;
}

// Pour la modification
export function EditReceiptPage({ params }: { params: { id: string } }) {
  const { data: receipt } = useGetReceipt(params.id);

  if (!receipt) return null;

  return <ReceiptForm initialData={receipt} isEditing={true} />;
}
