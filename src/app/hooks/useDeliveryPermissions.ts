import { IDeliveryResponse, IUser } from "@/app/interfaceHop";
import { ADMIN } from "@/shared/constantes";

export function useDeliveryPermissions(
  user: IUser | undefined | any,
  delivery?: IDeliveryResponse | undefined
) {
  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = !!user;

  // Vérifier si la livraison existe
  const isDeliveryValid = !!delivery;

  // Vérifier si l'utilisateur est l'expéditeur de la livraison
  const isSender =
    isAuthenticated && isDeliveryValid && user.id === delivery.senderId;

  // Vérifier si l'utilisateur est le voyageur assigné au trajet
  const isTraveler =
    isAuthenticated &&
    isDeliveryValid &&
    delivery.trip &&
    user.id === delivery.trip.travelerId;

  // Vérifier si l'utilisateur est le destinataire (si cette info est disponible)
  const isReceiver =
    isAuthenticated && isDeliveryValid && delivery.receiverId === user.id;

  // Vérifier si l'utilisateur est un administrateur
  const isAdmin = isAuthenticated && user.role === ADMIN;

  // Vérifier si l'utilisateur est soit l'expéditeur, soit le voyageur
  const isSenderOrTraveler = isSender || isTraveler;

  // Vérifier si l'utilisateur est impliqué dans la livraison d'une façon ou d'une autre
  const isInvolved = isSender || isTraveler || isReceiver;

  // Vérifier si l'utilisateur peut voir les détails de la livraison
  const canViewDeliveryDetails = isInvolved || isAdmin;

  // Vérifier si l'utilisateur peut modifier la livraison
  const canEditDelivery =
    isSender &&
    delivery?.status !== "DELIVERED" &&
    delivery?.status !== "CANCELED";

  // Vérifier si l'utilisateur peut supprimer la livraison
  const canDeleteDelivery =
    isSender &&
    delivery?.status !== "DELIVERED" &&
    delivery?.status !== "CANCELED";

  return {
    isAuthenticated,
    isSender,
    isTraveler,
    isReceiver,
    isAdmin,
    isSenderOrTraveler,
    isInvolved,
    canViewDeliveryDetails,
    canEditDelivery,
    canDeleteDelivery,
  };
}
