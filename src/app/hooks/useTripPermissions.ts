import { IDelivery, ITrip, IUser } from "@/app/interfaceHop";
import { ADMIN, TRAVELER } from "@/shared/constantes";

export function useTripPermissions(
  user: IUser | undefined,
  trip?: ITrip | undefined
) {
  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = !!user;

  // Vérifier si le voyage existe
  const isTripValid = !!trip;

  // Vérifier si l'utilisateur est le voyageur (créateur du voyage)
  const isTripCreator =
    isAuthenticated && isTripValid && user.id === trip.travelerId;

  // Vérifier si l'utilisateur est un voyageur (par rôle)
  const isTravelerRole = isAuthenticated && user.role === TRAVELER;

  // Vérifier si l'utilisateur est un administrateur
  const isAdmin = isAuthenticated && user.role === ADMIN;

  // Vérifier si l'utilisateur est un expéditeur associé à une livraison pour ce voyage
  const isSenderForTrip =
    isAuthenticated &&
    isTripValid &&
    trip.deliveries &&
    trip.deliveries.some(
      (delivery: IDelivery) => delivery.senderId === user.id
    );

  // Vérifier si l'utilisateur est impliqué dans le voyage d'une façon ou d'une autre
  const isInvolved = isTripCreator || isSenderForTrip;

  // Vérifier si le voyage est modifiable (pas encore commencé ou en cours)
  const isTripEditable =
    isTripValid && !["COMPLETED", "CANCELED"].includes(trip.status);

  // Permissions spécifiques

  // Peut voir les détails du voyage
  const canViewTripDetails = isInvolved || isAdmin;

  // Peut modifier le voyage (seulement le créateur ou admin, et si le voyage n'est pas terminé/annulé)
  const canEditTrip = (isTripCreator || isAdmin) && isTripEditable;

  // Peut annuler le voyage (seulement le créateur ou admin, et si le voyage n'est pas terminé/annulé)
  const canCancelTrip = (isTripCreator || isAdmin) && isTripEditable;

  // Peut ajouter une livraison au voyage (tout voyageur peut ajouter à son propre voyage)
  const canAddDelivery = isTripCreator && isTripEditable;

  // Peut compléter/finaliser le voyage
  const canCompleteTrip =
    isTripCreator && isTripValid && trip.status === "IN_PROGRESS";

  // Peut afficher les informations financières (paiements, revenus, etc.)
  const canViewFinancials = isTripCreator || isAdmin;

  return {
    isAuthenticated,
    isTripCreator,
    isTravelerRole,
    isAdmin,
    isSenderForTrip,
    isInvolved,
    canViewTripDetails,
    canEditTrip,
    canCancelTrip,
    canAddDelivery,
    canCompleteTrip,
    canViewFinancials,
    isTripEditable,
  };
}
