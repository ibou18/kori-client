import { Mail, MessageSquare, Phone, StickyNote, Tag, Users, type LucideIcon } from "lucide-react";

export const CRM_STATUSES: { value: string; label: string; color: string }[] = [
  { value: "NEW", label: "Nouveau", color: "bg-blue-100 text-blue-800" },
  { value: "TO_CONTACT", label: "À contacter", color: "bg-orange-100 text-orange-800" },
  { value: "CONTACTED", label: "Contacté", color: "bg-purple-100 text-purple-800" },
  { value: "FOLLOW_UP", label: "Relance prévue", color: "bg-yellow-100 text-yellow-800" },
  { value: "ONBOARDING", label: "En activation", color: "bg-cyan-100 text-cyan-800" },
  { value: "ACTIVE", label: "Actif", color: "bg-emerald-100 text-emerald-800" },
  { value: "AT_RISK", label: "À risque", color: "bg-red-100 text-red-800" },
  { value: "INACTIVE", label: "Inactif", color: "bg-gray-100 text-gray-800" },
  { value: "LOST", label: "Perdu", color: "bg-zinc-200 text-zinc-800" },
];

export const CRM_NOTE_TYPES: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "NOTE", label: "Note", icon: StickyNote },
  { value: "CALL", label: "Appel", icon: Phone },
  { value: "EMAIL", label: "Email", icon: Mail },
  { value: "SMS", label: "SMS", icon: MessageSquare },
  { value: "MEETING", label: "Rendez-vous", icon: Users },
  { value: "STATUS_CHANGE", label: "Statut", icon: Tag },
];

export interface CrmNote {
  id: string;
  type: string;
  content: string;
  status?: string | null;
  followUpAt?: string | null;
  salonId?: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null;
}

export interface CrmState {
  crmStatus?: string | null;
  crmLastContactAt?: string | null;
  crmNextFollowUpAt?: string | null;
}
