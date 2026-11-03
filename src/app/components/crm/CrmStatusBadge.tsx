import { Badge } from "@/components/ui/badge";
import { CRM_STATUSES } from "./crmConstants";

export function CrmStatusBadge({ status }: { status?: string | null }) {
  if (!status) {
    return <Badge variant="outline" className="text-muted-foreground">Sans statut</Badge>;
  }
  const config = CRM_STATUSES.find((s) => s.value === status);
  return (
    <Badge className={config?.color || "bg-gray-100 text-gray-800"}>
      {config?.label || status}
    </Badge>
  );
}
