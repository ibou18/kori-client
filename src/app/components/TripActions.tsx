/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash,
  Play,
  Ban,
  Package,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { message } from "antd";
import {
  useDeleteTrip,
  useUpdateTrip,
  useUpdateTripStatus,
} from "../data/hooksHop";
import { useQueryClient } from "@tanstack/react-query";

import { TripStatus } from "../interfaceHop";
import { useRouter } from "next/navigation";
import { GET_TRIPS } from "@/shared/constantes";
import { DeliveryForm } from "./form/DeliveryForm";
import { useSession } from "next-auth/react";

interface TripActionsProps {
  trip: any;
  onUpdate?: () => void;
}

export function TripActions({ trip, onUpdate }: TripActionsProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: session,
  }: {
    data: any;
  } = useSession();

  console.log("session", session);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<TripStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openDeliveryRequestModal, setOpenDeliveryRequestModal] =
    useState(false);
  const [packageDescription, setPackageDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);

  const { mutate: deleteTrip } = useDeleteTrip();
  const { mutate: updateTripStatus } = useUpdateTripStatus();

  const handleDeleteTrip = async () => {
    setIsLoading(true);
    deleteTrip(trip.id, {
      onSuccess: () => {
        message.success("Trajet supprimé avec succès");
        queryClient.invalidateQueries({ queryKey: [GET_TRIPS] });
        if (onUpdate) onUpdate();
        setOpenDeleteModal(false);
        setIsLoading(false);
      },
      onError: (error: any) => {
        message.error(
          error.formattedMessage || "Erreur lors de la suppression du trajet"
        );
        setIsLoading(false);
      },
    });
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;
    const payload: any = {
      id: trip.id,
      status: newStatus,
    };
    setIsLoading(true);
    updateTripStatus(payload, {
      onSuccess: () => {
        message.success(`Trajet marqué comme ${getStatusLabel(newStatus)}`);
        queryClient.invalidateQueries({ queryKey: [GET_TRIPS] });
        if (onUpdate) onUpdate();
        setOpenStatusModal(false);
        setIsLoading(false);
      },
      onError: (error: any) => {
        message.error(
          error.formattedMessage || "Erreur lors de la mise à jour du statut"
        );
        setIsLoading(false);
      },
    });
  };

  const getStatusLabel = (status: TripStatus) => {
    switch (status) {
      case "SCHEDULED":
        return "Programmé";
      case "IN_PROGRESS":
        return "En cours";
      case "COMPLETED":
        return "Terminé";
      case "CANCELED":
        return "Annulé";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: TripStatus) => {
    switch (status) {
      case "SCHEDULED":
        return <MapPin className="size-4 mr-2" />;
      case "IN_PROGRESS":
        return <Play className="size-4 mr-2" />;
      case "COMPLETED":
        return <CheckCircle className="size-4 mr-2" />;
      case "CANCELED":
        return <Ban className="size-4 mr-2" />;
      default:
        return <MapPin className="size-4 mr-2" />;
    }
  };

  const showStatusDialog = (status: TripStatus) => {
    setNewStatus(status);
    setOpenStatusModal(true);
  };

  const canChangeStatus = () => {
    return trip.status !== "COMPLETED" && trip.status !== "CANCELED";
  };

  const handleDeliveryRequest = async () => {
    setIsSubmittingDelivery(true);
    // Mock request
    setTimeout(() => {
      setIsSubmittingDelivery(false);
      setOpenDeliveryRequestModal(false);
      toast.success("Demande de livraison envoyée avec succès");
    }, 2000);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="secondary">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <Link href={`/admin/trips/${trip.id}/edit`}>
              <Pencil className="size-4 mr-2" /> Modifier le trajet
            </Link>
          </DropdownMenuItem>

          {trip._count?.deliveries > 0 && (
            <DropdownMenuItem asChild>
              <Link href={`/admin/trips/${trip.id}/deliveries`}>
                <Package className="size-4 mr-2" /> Voir les livraisons (
                {trip._count?.deliveries})
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {canChangeStatus() && (
            <>
              <DropdownMenuItem
                onClick={() => showStatusDialog("IN_PROGRESS" as TripStatus)}
                disabled={trip.status === "IN_PROGRESS"}
              >
                <Play className="size-4 mr-2" /> Marquer comme en cours
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => showStatusDialog("COMPLETED" as TripStatus)}
              >
                <CheckCircle className="size-4 mr-2" /> Marquer comme terminé
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => showStatusDialog("CANCELED" as TripStatus)}
              >
                <Ban className="size-4 mr-2" /> Annuler le trajet
              </DropdownMenuItem>

              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onClick={() => setOpenDeliveryRequestModal(true)}>
            <Package className="size-4 mr-2" /> Demander une livraison
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setOpenDeleteModal(true)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash className="size-4 mr-2" /> Supprimer le trajet
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialogue de confirmation pour la suppression */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer ce trajet</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce trajet ? Cette action est
              irréversible.
              {trip._count?.deliveries > 0 && (
                <p className="mt-2 text-red-500 font-semibold">
                  Attention : Ce trajet compte {trip._count.deliveries}{" "}
                  livraison{trip._count.deliveries > 1 ? "s" : ""} associée
                  {trip._count.deliveries > 1 ? "s" : ""}.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteModal(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTrip}
              disabled={isLoading}
            >
              {isLoading ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation pour le changement de statut */}
      <Dialog open={openStatusModal} onOpenChange={setOpenStatusModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le statut du trajet</DialogTitle>
            <DialogDescription>
              {newStatus && (
                <>
                  Êtes-vous sûr de vouloir marquer ce trajet comme{" "}
                  <span className="font-medium">
                    {getStatusLabel(newStatus)}
                  </span>{" "}
                  ?
                  {(newStatus === "COMPLETED" || newStatus === "CANCELED") &&
                    trip._count?.deliveries > 0 && (
                      <p className="mt-2 text-amber-500 font-semibold">
                        Attention : Ce trajet compte {trip._count.deliveries}{" "}
                        livraison{trip._count.deliveries > 1 ? "s" : ""}{" "}
                        associée{trip._count.deliveries > 1 ? "s" : ""}.
                      </p>
                    )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenStatusModal(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={isLoading}
              variant={newStatus === "CANCELED" ? "destructive" : "default"}
            >
              {isLoading ? "Mise à jour..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for requesting a delivery */}
      <Dialog
        open={openDeliveryRequestModal}
        onOpenChange={setOpenDeliveryRequestModal}
      >
        <DialogContent className="sm:max-w-[705px]">
          <DialogHeader>
            <DialogTitle>Demander une livraison</DialogTitle>
            <DialogDescription>
              Remplissez ce formulaire pour demander une livraison basée sur ce
              trajet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[90vh] overflow-y-auto pr-2">
            <DeliveryForm
              mode="create"
              trip={trip}
              user={session?.user}
              setOpenModal={setOpenDeliveryRequestModal}
            />
          </div>

          {/* <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeliveryRequestModal(false)}
              disabled={isSubmittingDelivery}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDeliveryRequest}
              disabled={isSubmittingDelivery}
            >
              {isSubmittingDelivery
                ? "Envoi en cours..."
                : "Demander la livraison"}
            </Button>
          </DialogFooter> */}
        </DialogContent>
      </Dialog>
    </>
  );
}
