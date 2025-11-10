import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  DollarSign,
  Ban,
  UserX,
  Calendar,
  PlayCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

// ===== BOOKING STATUS =====
export const getBookingStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; color: string; icon: any }> = {
    DRAFT: {
      label: "Brouillon",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: Clock,
    },
    PENDING: {
      label: "En attente",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: AlertCircle,
    },
    CONFIRMED: {
      label: "Confirmée",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: CheckCircle2,
    },
    IN_PROGRESS: {
      label: "En cours",
      color: "bg-purple-100 text-purple-800 border-purple-300",
      icon: PlayCircle,
    },
    COMPLETED: {
      label: "Terminée",
      color: "bg-[#F0F4F1] text-[#53745D] border-[#53745D]",
      icon: CheckCircle,
    },
    CANCELLED_BY_CLIENT: {
      label: "Annulée (Client)",
      color: "bg-red-100 text-red-800 border-red-300",
      icon: UserX,
    },
    CANCELLED_BY_PROVIDER: {
      label: "Annulée (Salon)",
      color: "bg-red-100 text-red-800 border-red-300",
      icon: Ban,
    },
    NO_SHOW: {
      label: "Absence",
      color: "bg-orange-100 text-orange-800 border-orange-300",
      icon: XCircle,
    },
  };

  return (
    configs[status] || {
      label: status,
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: AlertCircle,
    }
  );
};

export const BookingStatusBadge = ({ status }: { status: string }) => {
  const config = getBookingStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.color} flex items-center gap-1.5 font-medium`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};

// ===== PAYMENT STATUS =====
export const getPaymentStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; color: string; icon: any }> = {
    PENDING: {
      label: "En attente",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: Clock,
    },
    PAID: {
      label: "Payé",
      color: "bg-[#F0F4F1] text-[#53745D] border-[#53745D]",
      icon: CheckCircle,
    },
    PARTIALLY_PAID: {
      label: "Partiellement payé",
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: DollarSign,
    },
    REFUNDED: {
      label: "Remboursé",
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: XCircle,
    },
    FAILED: {
      label: "Échoué",
      color: "bg-red-100 text-red-800 border-red-300",
      icon: XCircle,
    },
  };

  return (
    configs[status] || {
      label: status,
      color: "bg-gray-100 text-gray-800 border-gray-300",
      icon: AlertCircle,
    }
  );
};

export const PaymentStatusBadge = ({ status }: { status: string }) => {
  const config = getPaymentStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.color} flex items-center gap-1.5 font-medium`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};

// ===== SALON STATUS =====
export const getSalonStatusConfig = (isActive: boolean, isVerified: boolean) => {
  if (!isActive) {
    return {
      label: "Inactif",
      color: "bg-red-100 text-red-800 border-red-300",
      icon: XCircle,
    };
  }

  if (!isVerified) {
    return {
      label: "Non vérifié",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: AlertCircle,
    };
  }

  return {
    label: "Actif",
    color: "bg-[#F0F4F1] text-[#53745D] border-[#53745D]",
    icon: CheckCircle,
  };
};

export const SalonStatusBadge = ({
  isActive,
  isVerified,
}: {
  isActive: boolean;
  isVerified: boolean;
}) => {
  const config = getSalonStatusConfig(isActive, isVerified);
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.color} flex items-center gap-1.5 font-medium`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};

// ===== USER STATUS =====
export const getUserStatusConfig = (status: string | boolean) => {
  // Gérer les deux formats : boolean (isActive) ou string (status)
  let isActive: boolean;
  if (typeof status === "boolean") {
    isActive = status;
  } else {
    // Si c'est une string, mapper les valeurs
    isActive = status === "ACTIVE" || status === "active" || status === "true";
  }

  if (isActive) {
    return {
      label: "Actif",
      color: "bg-[#F0F4F1] text-[#53745D] border-[#53745D]",
      icon: CheckCircle,
    };
  }

  return {
    label: "Inactif",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
  };
};

export const UserStatusBadge = ({
  status,
  isActive,
}: {
  status?: string;
  isActive?: boolean;
}) => {
  // Priorité : status si fourni, sinon isActive
  const statusValue = status !== undefined ? status : isActive;
  const config = getUserStatusConfig(statusValue as string | boolean);
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.color} flex items-center gap-1.5 font-medium`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
};

// ===== LOADING STATE =====
export const LoadingBadge = () => {
  return (
    <Badge
      variant="outline"
      className="bg-gray-100 text-gray-800 border-gray-300 flex items-center gap-1.5"
    >
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      Chargement...
    </Badge>
  );
};

