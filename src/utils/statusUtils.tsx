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
  Eye,
  EyeOff,
  HelpCircle,
  Wallet,
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

// ===== PASTILLE DE STATUT =====
/**
 * Badge texte + couleur partagé par les statuts salon. L'infobulle (`reason`)
 * précise le pourquoi quand le libellé seul ne suffit pas.
 */
export const StatusPill = ({
  config,
}: {
  config: { label: string; color: string; icon: any; reason?: string };
}) => {
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      title={config.reason || config.label}
      className={`${config.color} inline-flex w-fit items-center gap-1.5 whitespace-nowrap font-medium`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {config.label}
    </Badge>
  );
};

export const SalonStatusBadge = ({
  isActive,
  isVerified,
}: {
  isActive: boolean;
  isVerified: boolean;
}) => <StatusPill config={getSalonStatusConfig(isActive, isVerified)} />;

// ===== SALON VISIBILITÉ APPLICATION =====
// Un salon apparaît dans l'application cliente s'il est actif ET qu'il a au
// moins une photo active et au moins un service actif (règle appliquée côté
// serveur dans SalonService.getClientVisibleSalonFilter).
export const getSalonVisibilityConfig = ({
  isVisibleInApp,
  isActive,
  activePhotoCount,
  activeServiceCount,
}: {
  // Valeur calculée par l'API ; à défaut on la déduit des compteurs
  isVisibleInApp?: boolean;
  isActive: boolean;
  activePhotoCount?: number;
  activeServiceCount?: number;
}) => {
  // L'API ne renvoie aucune des données de visibilité (version serveur trop
  // ancienne, réponse en cache…) : ne rien affirmer plutôt que d'afficher à
  // tort « Non visible » pour toute la liste.
  if (
    isVisibleInApp === undefined &&
    (activePhotoCount === undefined || activeServiceCount === undefined)
  ) {
    return {
      label: "—",
      color: "bg-gray-50 text-gray-400 border-gray-200",
      icon: HelpCircle,
      reason: "Donnée de visibilité indisponible",
    };
  }

  const isVisible =
    isVisibleInApp ??
    (isActive && (activePhotoCount ?? 0) > 0 && (activeServiceCount ?? 0) > 0);

  if (isVisible) {
    return {
      label: "Visible",
      color: "bg-[#F0F4F1] text-[#53745D] border-[#53745D]",
      icon: Eye,
      reason: "Ce salon apparaît dans l'application",
    };
  }

  const missing: string[] = [];
  if (!isActive) missing.push("salon inactif");
  if (activePhotoCount === 0) missing.push("aucune photo");
  if (activeServiceCount === 0) missing.push("aucun service");
  if (missing.length === 0) missing.push("photo ou service manquant");

  return {
    label: "Non visible",
    color: "bg-gray-100 text-gray-700 border-gray-300",
    icon: EyeOff,
    reason: missing.length
      ? `Non visible dans l'application : ${missing.join(", ")}`
      : "Non visible dans l'application",
  };
};

export const SalonVisibilityBadge = ({
  isVisibleInApp,
  isActive,
  activePhotoCount,
  activeServiceCount,
}: {
  isVisibleInApp?: boolean;
  isActive: boolean;
  activePhotoCount?: number;
  activeServiceCount?: number;
}) => (
  <StatusPill
    config={getSalonVisibilityConfig({
      isVisibleInApp,
      isActive,
      activePhotoCount,
      activeServiceCount,
    })}
  />
);

// ===== SALON COLLECTE D'ACOMPTE =====
// Un acompte n'est prélevé que si les 3 conditions sont réunies : flag
// plateforme + opt-in du salon + compte Stripe capable d'encaisser.
// Un salon qui a opté sans Stripe opérationnel reçoit ses réservations, mais
// sans acompte (repli PLATFORM_FEE_ONLY) — d'où l'état intermédiaire.
export const getSalonDepositConfig = ({
  collectsDeposit,
  depositEnabled,
  stripeChargesEnabled,
  platformDepositEnabled,
}: {
  collectsDeposit?: boolean;
  depositEnabled?: boolean;
  stripeChargesEnabled?: boolean;
  platformDepositEnabled?: boolean;
}) => {
  if (collectsDeposit === undefined && depositEnabled === undefined) {
    return {
      label: "—",
      color: "bg-gray-50 text-gray-400 border-gray-200",
      icon: HelpCircle,
      reason: "Donnée d'acompte indisponible",
    };
  }

  if (collectsDeposit) {
    return {
      label: "Acompte",
      color: "bg-[#F0F4F1] text-[#53745D] border-[#53745D]",
      icon: Wallet,
      reason: "Ce salon collecte un acompte sur ses réservations",
    };
  }

  // Le salon a demandé la collecte mais elle ne s'applique pas encore.
  if (depositEnabled) {
    const blocker = !platformDepositEnabled
      ? "la collecte d'acompte est désactivée au niveau de la plateforme"
      : !stripeChargesEnabled
        ? "son compte Stripe ne peut pas encore encaisser"
        : "une condition n'est pas remplie";
    return {
      label: "En attente",
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: AlertCircle,
      reason: `Salon inscrit à la collecte d'acompte, mais ${blocker} — les réservations passent sans acompte`,
    };
  }

  return {
    label: "Sans acompte",
    color: "bg-gray-100 text-gray-700 border-gray-300",
    icon: Ban,
    reason: "Ce salon n'a pas opté pour la collecte d'acompte",
  };
};

export const SalonDepositBadge = ({
  collectsDeposit,
  depositEnabled,
  stripeChargesEnabled,
  platformDepositEnabled,
}: {
  collectsDeposit?: boolean;
  depositEnabled?: boolean;
  stripeChargesEnabled?: boolean;
  platformDepositEnabled?: boolean;
}) => (
  <StatusPill
    config={getSalonDepositConfig({
      collectsDeposit,
      depositEnabled,
      stripeChargesEnabled,
      platformDepositEnabled,
    })}
  />
);

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

