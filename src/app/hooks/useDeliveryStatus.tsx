import { Badge } from "@/components/ui/badge";
import { PACKAGE_CATEGORIES, PACKAGE_SIZES } from "@/shared/constantes";
import {
  CalendarIcon,
  ClipboardListIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  CircleIcon,
} from "lucide-react";

export const useDeliveryStatusBadge = () => {
  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case "UNASSIGNED":
        return (
          <Badge className="bg-gray-200 text-gray-700">Non assignée</Badge>
        );
      case "RESERVED":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Réservée</Badge>
        );
      case "PAYMENT_PENDING":
        return (
          <Badge className="bg-blue-100 text-blue-800">Paiement en cours</Badge>
        );
      case "PAYMENT_SUCCESS":
        return <Badge className="bg-green-100 text-green-800">Payée</Badge>;
      case "PAYMENT_FAILED":
        return (
          <Badge className="bg-red-100 text-red-800">Échec de paiement</Badge>
        );
      case "PENDING":
        return <Badge className="bg-gray-100 text-gray-800">En attente</Badge>;
      case "ACCEPTED":
        return <Badge className="bg-blue-100 text-blue-800">Acceptée</Badge>;
      case "PICKED_UP":
        return <Badge className="bg-amber-100 text-amber-800">Collectée</Badge>;
      case "IN_TRANSIT":
        return (
          <Badge className="bg-purple-100 text-purple-800">En transit</Badge>
        );
      case "DELIVERED":
        return <Badge className="bg-green-100 text-green-800">Livrée</Badge>;
      case "CANCELED":
        return <Badge className="bg-red-100 text-red-800">Annulée</Badge>;
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800">Échouée</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return { getDeliveryStatusBadge };
};

export const usePackageStatusBadge = () => {
  const getPackageStatusBadge = (status: string) => {
    switch (status) {
      case "REGISTERED":
        return <Badge className="bg-gray-100 text-gray-800">Enregistré</Badge>;
      case "PENDING":
        return <Badge className="bg-gray-100 text-gray-800">En attente</Badge>;
      case "PREPARED":
        return <Badge className="bg-blue-100 text-blue-800">Préparé</Badge>;
      case "PICKED_UP":
        return <Badge className="bg-amber-100 text-amber-800">Collecté</Badge>;
      case "IN_TRANSIT":
        return (
          <Badge className="bg-purple-100 text-purple-800">En transit</Badge>
        );
      case "DELIVERED":
        return <Badge className="bg-green-100 text-green-800">Livré</Badge>;
      case "RETURNED":
        return (
          <Badge className="bg-orange-100 text-orange-800">Retourné</Badge>
        );
      case "LOST":
        return <Badge className="bg-red-100 text-red-800">Perdu</Badge>;
      case "DAMAGED":
        return <Badge className="bg-red-100 text-red-800">Endommagé</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return { getPackageStatusBadge };
};

// Hook pour afficher la taille d'un colis
export const usePackageSize = () => {
  // Fonction qui renvoie le libellé correspondant à la valeur de la taille
  const getPackageSizeLabel = (size: string) => {
    const packageSize = PACKAGE_SIZES.find((item) => item.value === size);
    if (!packageSize) return size;

    // Pour les anciennes entrées qui n'ont pas de description
    if (!packageSize.description) {
      return packageSize.label;
    }

    // Pour les nouvelles entrées avec description, combiner le label et le volume
    return `${packageSize.label} ${packageSize.volume || ""}`;
  };

  // Fonction qui renvoie la description détaillée de la taille (si disponible)
  const getPackageSizeDescription = (size: string) => {
    const packageSize = PACKAGE_SIZES.find((item) => item.value === size);
    return packageSize?.description || "";
  };

  // Fonction qui renvoie uniquement l'emoji et le nom court (sans le volume)
  const getPackageSizeShortLabel = (size: string) => {
    const packageSize = PACKAGE_SIZES.find((item) => item.value === size);
    if (!packageSize) return size;

    return packageSize.label;
  };

  // Fonction qui renvoie un badge avec l'emoji et le nom
  const getPackageSizeBadge = (size: string) => {
    const packageSize = PACKAGE_SIZES.find((item) => item.value === size);
    if (!packageSize) return <Badge>{size}</Badge>;

    // Déterminer la couleur du badge en fonction de la taille
    let badgeClass = "bg-gray-100 text-gray-800";

    switch (size) {
      case "LETTER":
        badgeClass = "bg-blue-50 text-blue-700";
        break;
      case "EXTRA_SMALL":
        badgeClass = "bg-cyan-50 text-cyan-700";
        break;
      case "SMALL":
        badgeClass = "bg-green-50 text-green-700";
        break;
      case "MEDIUM":
        badgeClass = "bg-yellow-50 text-yellow-700";
        break;
      case "LARGE":
        badgeClass = "bg-orange-50 text-orange-700";
        break;
      case "EXTRA_LARGE":
        badgeClass = "bg-red-50 text-red-700";
        break;
      case "JUMBO":
        badgeClass = "bg-purple-50 text-purple-700";
        break;
    }

    return <Badge className={badgeClass}>{packageSize.label}</Badge>;
  };

  // Composant qui affiche le badge avec un tooltip de description au survol
  const PackageSizeInfo = ({ size }: { size: string }) => {
    const packageSize = PACKAGE_SIZES.find((item) => item.value === size);
    if (!packageSize) return <Badge>{size}</Badge>;

    let badgeClass = "bg-gray-100 text-gray-800";
    switch (size) {
      case "LETTER":
        badgeClass = "bg-blue-50 text-blue-700";
        break;
      case "EXTRA_SMALL":
        badgeClass = "bg-cyan-50 text-cyan-700";
        break;
      case "SMALL":
        badgeClass = "bg-green-50 text-green-700";
        break;
      case "MEDIUM":
        badgeClass = "bg-yellow-50 text-yellow-700";
        break;
      case "LARGE":
        badgeClass = "bg-orange-50 text-orange-700";
        break;
      case "EXTRA_LARGE":
        badgeClass = "bg-red-50 text-red-700";
        break;
      case "JUMBO":
        badgeClass = "bg-purple-50 text-purple-700";
        break;
    }

    return (
      <div className="group relative inline-block">
        <Badge className={`${badgeClass} cursor-help`}>
          {packageSize.label}
        </Badge>
        {packageSize.description && (
          <div className="hidden group-hover:block absolute z-10 w-64 p-2 mt-2 text-sm bg-white rounded-md shadow-lg border border-gray-200">
            <p>{packageSize.description}</p>
            <p className="text-xs text-gray-500 mt-1">{packageSize.volume}</p>
          </div>
        )}
      </div>
    );
  };

  return {
    getPackageSizeLabel,
    getPackageSizeDescription,
    getPackageSizeShortLabel,
    getPackageSizeBadge,
    PackageSizeInfo,
  };
};

export const usePackageCategory = () => {
  // Fonction qui renvoie le libellé correspondant à la valeur de la catégorie
  const getPackageCategoryLabel = (category: string) => {
    const packageCategory = PACKAGE_CATEGORIES.find(
      (item) => item.value === category
    );
    return packageCategory ? packageCategory.label : category;
  };

  // Fonction qui renvoie uniquement l'emoji et le nom court
  const getPackageCategoryShortLabel = (category: string) => {
    const packageCategory = PACKAGE_CATEGORIES.find(
      (item) => item.value === category
    );
    if (!packageCategory) return category;

    // Les libellés sont déjà au format "emoji texte", donc on peut les retourner directement
    return packageCategory.label;
  };

  // Fonction qui renvoie un badge avec l'emoji et le nom
  const getPackageCategoryBadge = (category: string) => {
    if (!category) return <Badge>Non spécifié</Badge>;

    // Déterminer la couleur du badge en fonction de la catégorie
    let badgeClass = "bg-gray-100 text-gray-800";

    switch (category) {
      case "CLOTHING":
        badgeClass = "bg-pink-50 text-pink-700";
        break;
      case "ELECTRONICS":
        badgeClass = "bg-cyan-50 text-cyan-700";
        break;
      case "FURNITURE":
        badgeClass = "bg-amber-50 text-amber-700";
        break;
      case "APPLIANCES":
        badgeClass = "bg-orange-50 text-orange-700";
        break;
      case "BOOKS":
        badgeClass = "bg-indigo-50 text-indigo-700";
        break;
      case "TOYS":
        badgeClass = "bg-purple-50 text-purple-700";
        break;
      case "SPORTS":
        badgeClass = "bg-green-50 text-green-700";
        break;
      case "MEDICAL":
        badgeClass = "bg-blue-50 text-blue-700";
        break;
      case "PERISHABLE":
        badgeClass = "bg-lime-50 text-lime-700";
        break;
      case "LIQUIDS":
        badgeClass = "bg-sky-50 text-sky-700";
        break;
      case "HAZARDOUS":
        badgeClass = "bg-red-50 text-red-700";
        break;
      case "FOOD":
        badgeClass = "bg-yellow-50 text-yellow-700";
        break;
      case "OTHER":
        badgeClass = "bg-gray-100 text-gray-800";
        break;
    }

    const packageCategory = PACKAGE_CATEGORIES.find(
      (item) => item.value === category
    );
    const label = packageCategory ? packageCategory.label : category;

    return <Badge className={badgeClass}>{label}</Badge>;
  };

  return {
    getPackageCategoryLabel,
    getPackageCategoryShortLabel,
    getPackageCategoryBadge,
  };
};

// creer moi un hook pour le payment status badge
export const usePaymentStatusBadge = () => {
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
        );
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800">Complété</Badge>;
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800">Échoué</Badge>;
      case "REFUNDED":
        return <Badge className="bg-blue-100 text-blue-800">Remboursé</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return { getPaymentStatusBadge };
};

// Hook pour les statuts de voyage
export const useTripStatus = () => {
  const getTripStatusInfo = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return { label: "Prévu", color: "bg-blue-100 text-blue-800" };
      case "PLANNED":
        return { label: "Planifié", color: "bg-indigo-100 text-indigo-800" };
      case "IN_PROGRESS":
        return { label: "En cours", color: "bg-yellow-100 text-yellow-800" };
      case "COMPLETED":
        return { label: "Complété", color: "bg-green-100 text-green-800" };
      case "CANCELED":
        return { label: "Annulé", color: "bg-red-100 text-red-800" };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800" };
    }
  };

  // Fonction qui renvoie un badge avec le statut du voyage
  const getTripStatusBadge = (status: string) => {
    const statusInfo = getTripStatusInfo(status);
    return <Badge className={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  // Fonction qui renvoie le libellé correspondant au statut
  const getTripStatusLabel = (status: string) => {
    const statusInfo = getTripStatusInfo(status);
    return statusInfo.label;
  };

  // Fonction qui détermine si le voyage est actif (en cours ou planifié)
  const isTripActive = (status: string) => {
    return (
      status === "SCHEDULED" || status === "PLANNED" || status === "IN_PROGRESS"
    );
  };

  // Fonction qui détermine si le voyage est terminé
  const isTripCompleted = (status: string) => {
    return status === "COMPLETED";
  };

  // Fonction qui détermine si le voyage est annulé
  const isTripCanceled = (status: string) => {
    return status === "CANCELED";
  };

  // Fonction qui renvoie les actions possibles selon le statut
  const getTripAvailableActions = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return ["start", "cancel", "edit"];
      case "PLANNED":
        return ["confirm", "cancel", "edit"];
      case "IN_PROGRESS":
        return ["complete", "cancel", "update"];
      case "COMPLETED":
        return ["review", "report"];
      case "CANCELED":
        return ["restore"];
      default:
        return [];
    }
  };

  // Composant qui affiche le statut avec des icônes appropriées
  const TripStatusIndicator = ({ status }: { status: string }) => {
    const statusInfo = getTripStatusInfo(status);
    let icon;

    switch (status) {
      case "SCHEDULED":
        icon = <CalendarIcon className="h-4 w-4 mr-1" />;
        break;
      case "PLANNED":
        icon = <ClipboardListIcon className="h-4 w-4 mr-1" />;
        break;
      case "IN_PROGRESS":
        icon = <TruckIcon className="h-4 w-4 mr-1" />;
        break;
      case "COMPLETED":
        icon = <CheckCircleIcon className="h-4 w-4 mr-1" />;
        break;
      case "CANCELED":
        icon = <XCircleIcon className="h-4 w-4 mr-1" />;
        break;
      default:
        icon = <CircleIcon className="h-4 w-4 mr-1" />;
    }

    return (
      <div className="flex items-center">
        {icon}
        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
      </div>
    );
  };

  // Renvoyer les fonctions et composants du hook
  return {
    getTripStatusBadge,
    getTripStatusLabel,
    isTripActive,
    isTripCompleted,
    isTripCanceled,
    getTripAvailableActions,
    TripStatusIndicator,
  };
};
