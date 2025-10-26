import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function formatDate(dateInput?: string | Date) {
  if (!dateInput) return "-";
  const dateObj =
    typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return format(dateObj, "dd MMM yyyy à HH:mm", { locale: fr });
}

export function formatShortDate(dateInput?: string | Date) {
  if (!dateInput) return "-";
  const dateObj =
    typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return format(dateObj, "dd MMM yyyy", { locale: fr });
}
