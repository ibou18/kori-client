/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { formatCurrency } from "@/utils/formatCurrency";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "./EmptyState";
import { Package, Car, Clock, MapPin, Calendar, User, Eye } from "lucide-react";

import { format } from "date-fns";
import { fr, se } from "date-fns/locale";
import { CustomPagination } from "./CustomPagination";
import { SearchInput } from "./SearchInput";
import { useTranslations } from "next-intl";
import { TripStatus, VehicleType } from "../interfaceHop";
import { useState } from "react";
import { TripActions } from "./TripActions";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useSession } from "next-auth/react";

interface VehicleTypeInfo {
  label: string;
  icon: React.ReactNode;
}

interface TripListProps {
  data: any;
  onPageChange?: (page: number) => void;
  onSearchChange?: (term: string) => void;
  isLoading?: boolean;
}

const vehicleTypeMap: Record<VehicleType, VehicleTypeInfo> = {
  CAR: { label: "Voiture", icon: <Car size={16} /> },
  SUV: { label: "SUV", icon: <Car size={16} /> },
  VAN: { label: "Van", icon: <Car size={16} /> },
  TRUCK: { label: "Camion", icon: <Car size={16} /> },
  BIKE: { label: "Vélo", icon: <Car size={16} /> },
  SCOOTER: { label: "Scooter", icon: <Car size={16} /> },
  PUBLIC_TRANSPORT: { label: "Transport public", icon: <Car size={16} /> },
  OTHER: { label: "Autre", icon: <Car size={16} /> },
  MOTORCYCLE: { label: "Moto", icon: <Car size={16} /> },
};

export function TripList({
  data,
  onPageChange,
  onSearchChange,
  isLoading = false,
}: TripListProps) {
  const t = useTranslations("trip");
  const {
    data: session,
  }: {
    data: any;
  } = useSession();

  // État local uniquement pour la recherche dans ce composant
  const [searchTerm, setSearchTerm] = useState("");
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);

  // Extraction des trajets et des informations de pagination directement des props
  const trips = data?.trips || [];
  const paginationInfo = data?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  };

  // Fonction pour gérer le changement de page
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // Fonction pour gérer la recherche
  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);

    // Propagation de la recherche au composant parent
    if (onSearchChange) {
      onSearchChange(searchValue);
    }
  };

  // Fonction pour obtenir une couleur basée sur le statut
  const getStatusColor = (status: TripStatus) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-amber-100 text-amber-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fonction pour obtenir le texte du statut
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

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: fr });
  };

  return (
    <>
      <div className="">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full">
            <SearchInput
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Rechercher un trajet..."
              className="w-full mb-4"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !trips || trips.length === 0 ? (
          <EmptyState
            title="Aucun trajet trouvé"
            description="Commencez par créer un nouveau trajet"
            buttontext="Créer un trajet"
            href="/admin/trips/create"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voyageur</TableHead>
                    <TableHead>Départ</TableHead>
                    <TableHead>Véhicule</TableHead>
                    <TableHead>Colis</TableHead>
                    <TableHead>Capacité</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip: any) => (
                    <TableRow key={trip.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>
                            {trip.traveler?.firstName} {trip.traveler?.lastName}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span
                              className="truncate max-w-[150px]"
                              title={trip.startLocation}
                            >
                              {trip.startLocation}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 ml-6">
                            {formatDate(trip.startTime)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span
                              className="truncate max-w-[150px]"
                              title={trip.endLocation}
                            >
                              {trip.endLocation}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 ml-6">
                            {formatDate(trip.endTime)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          {vehicleTypeMap[trip.vehicleType as VehicleType]
                            ?.icon || <Car size={16} />}
                          <span>
                            {vehicleTypeMap[trip.vehicleType as VehicleType]
                              ?.label || trip.vehicleType}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Package size={16} />
                          <span className="text-sm">
                            {trip._count?.deliveries || 0}/{trip.maxPackages}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-500">
                            {trip.maxWeight ? `${trip.maxWeight} kg` : "-"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {trip.availableSpace
                              ? `${trip.availableSpace} L`
                              : "-"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={getStatusColor(trip.status)}>
                          {getStatusLabel(trip.status)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Eye
                            size={16}
                            onClick={() => {
                              setOpenDetail(true);
                              setSelectedTrip(trip);
                            }}
                          />
                          <TripActions trip={trip} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Dialog open={openDetail} onOpenChange={setOpenDetail}>
              <DialogContent className="sm:max-w-[705px]">
                <DialogHeader>
                  <DialogTitle>Détail du voyage</DialogTitle>
                  <DialogDescription>
                    {selectedTrip?.startLocation} - {selectedTrip?.endLocation}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                  hello
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

            <CustomPagination
              currentPage={paginationInfo.page}
              totalPages={paginationInfo.pages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </>
  );
}
