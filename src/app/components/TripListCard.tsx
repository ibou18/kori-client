"use client";

import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ITrip, TripStatus, VehicleType } from "../interfaceHop";
import { EmptyState } from "./EmptyState";
import { SearchInput } from "./SearchInput";
import { CustomPagination } from "./CustomPagination";

import { formatCurrency } from "@/utils/formatCurrency";
import {
  Package,
  Car,
  Bike,
  Truck,
  Bus,
  HelpCircle,
  MapPin,
  User,
  Weight,
  BoxIcon,
  BikeIcon,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface VehicleTypeInfo {
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface TripListCardProps {
  data: any;
  onPageChange?: (page: number) => void;
  onSearchChange?: (term: string) => void;
  isLoading?: boolean;
}

const vehicleTypeMap: Record<VehicleType, VehicleTypeInfo> = {
  CAR: { label: "Voiture", icon: <Car size={16} />, color: "bg-blue-50" },
  SUV: { label: "SUV", icon: <Car size={16} />, color: "bg-blue-50" },
  VAN: { label: "Van", icon: <Truck size={16} />, color: "bg-amber-50" },
  TRUCK: { label: "Camion", icon: <Truck size={16} />, color: "bg-amber-50" },
  BIKE: { label: "Vélo", icon: <Bike size={16} />, color: "bg-green-50" },
  SCOOTER: {
    label: "Scooter",
    icon: <BikeIcon size={16} />,
    color: "bg-green-50",
  },
  PUBLIC_TRANSPORT: {
    label: "Transport public",
    icon: <Bus size={16} />,
    color: "bg-purple-50",
  },
  OTHER: {
    label: "Autre",
    icon: <HelpCircle size={16} />,
    color: "bg-gray-50",
  },
  MOTORCYCLE: {
    label: "Moto",
    icon: <BikeIcon size={16} />,
    color: "bg-green-50",
  },
};

export function TripListCard({
  data,
  onPageChange,
  onSearchChange,
  isLoading = false,
}: TripListCardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<ITrip | null>(null);

  // Extraction des trajets et des informations de pagination
  const trips = data?.trips || [];
  const paginationInfo = data?.pagination || {
    total: 0,
    page: 1,
    limit: 12,
    pages: 0,
  };

  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return "-";
    const dateObj =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return format(dateObj, "dd MMM yyyy à HH:mm", { locale: fr });
  };

  const formatShortDate = (dateInput?: string | Date) => {
    if (!dateInput) return "-";
    const dateObj =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return format(dateObj, "dd MMM", { locale: fr });
  };

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
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

  return (
    <div className="space-y-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip: ITrip) => {
              const vehicleInfo =
                vehicleTypeMap[trip.vehicleType as VehicleType] ||
                vehicleTypeMap.OTHER;

              return (
                <>
                  <Card
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-l-4"
                    style={{
                      borderLeftColor:
                        trip.status === "SCHEDULED"
                          ? "#3b82f6"
                          : trip.status === "IN_PROGRESS"
                          ? "#f59e0b"
                          : trip.status === "COMPLETED"
                          ? "#10b981"
                          : "#9ca3af",
                    }}
                  >
                    <CardHeader className="py-3 px-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0">
                            {vehicleInfo.icon}
                          </div>
                          <div className="flex items-center font-medium text-sm">
                            <span className="truncate max-w-[80px]">
                              {trip.startCity}
                            </span>
                            <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
                            <span className="truncate max-w-[80px]">
                              {trip.endCity}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(trip.status)}>
                            {getStatusLabel(trip.status)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setSelectedTrip(trip)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    {/* <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild> */}
                    <CardContent className="py-2 px-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[150px]">
                            {trip.traveler?.firstName} {trip.traveler?.lastName}
                          </span>
                        </div>
                        <div className="text-sm font-semibold">
                          {formatShortDate(trip.startTime)}
                        </div>
                      </div>
                    </CardContent>
                    {/* </TooltipTrigger>
                        <TooltipContent
                          side="bottom"
                          className="p-0 bg-white rounded-md shadow-lg border"
                        >
                          <div className="w-64 p-3">
                            <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                              <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                                <Package className="h-4 w-4 text-gray-500 mb-1" />
                                <span className="text-xs text-gray-600">
                                  Colis
                                </span>
                                <span className="font-medium">
                                  {trip._count?.deliveries || 0}/
                                  {trip.maxPackages}
                                </span>
                                hello
                              </div>
                              <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                                <BoxIcon className="h-4 w-4 text-gray-500 mb-1" />
                                <span className="text-xs text-gray-600">
                                  Volume
                                </span>
                                <span className="font-medium">
                                  {trip.availableSpace
                                    ? `${trip.availableSpace}L`
                                    : "-"}
                                </span>
                              </div>
                              <div className="flex flex-col items-center p-2 bg-gray-50 rounded-md">
                                <Weight className="h-4 w-4 text-gray-500 mb-1" />
                                <span className="text-xs text-gray-600">
                                  Poids
                                </span>
                                <span className="font-medium">
                                  {trip.maxWeight ? `${trip.maxWeight}kg` : "-"}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-xs">
                                  {formatDate(trip.startTime)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-xs">
                                  {trip.startCity}, {trip.startCountry}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-xs">
                                  {trip.endCity}, {trip.endCountry}
                                </span>
                              </div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider> */}
                    <CardFooter className="py-2 px-4 bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="text-xs">
                          {trip._count?.deliveries || 0}/{trip.maxPackages}{" "}
                          colis
                        </span>
                      </div>
                      {/* <div className="text-sm font-semibold text-orange-500">
                        {formatCurrency({
                          amount: trip.price ?? 0,
                          currency: "CAD",
                        })}
                      </div> */}
                    </CardFooter>
                  </Card>
                </>
              );
            })}
          </div>

          <Dialog
            open={!!selectedTrip}
            onOpenChange={(open) => !open && setSelectedTrip(null)}
          >
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex justify-between">
                  <span>Détails du voyage</span>
                  <DialogClose
                    className="h-4 w-4 opacity-70 hover:opacity-100"
                    asChild
                  ></DialogClose>
                </DialogTitle>
              </DialogHeader>

              {selectedTrip && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge className={getStatusColor(selectedTrip.status)}>
                      {getStatusLabel(selectedTrip.status)}
                    </Badge>
                    <div className="font-semibold text-orange-500">
                      {formatCurrency({
                        amount: selectedTrip.price ?? 0,
                        currency: "CAD",
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Voyageur</h3>
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <span>
                          {selectedTrip.traveler?.firstName}{" "}
                          {selectedTrip.traveler?.lastName}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Véhicule</h3>
                      <div className="flex items-center">
                        {
                          vehicleTypeMap[
                            selectedTrip.vehicleType as VehicleType
                          ]?.icon
                        }
                        <span className="ml-2">
                          {
                            vehicleTypeMap[
                              selectedTrip.vehicleType as VehicleType
                            ]?.label
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-md space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Départ</h3>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                          <p>
                            {selectedTrip.startCity},{" "}
                            {selectedTrip.startCountry}
                          </p>
                          <p className="text-sm text-orange-500">
                            {formatDate(selectedTrip.startTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold mb-1">Arrivée</h3>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                          <p>
                            {selectedTrip.endCity}, {selectedTrip.endCountry}
                          </p>
                          <p className="text-sm text-orange-500">
                            {formatDate(
                              selectedTrip.endTime || selectedTrip.startTime
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-md">
                      <Package className="h-5 w-5 text-gray-500 mb-1" />
                      <span className="text-xs text-gray-600">Colis</span>
                      <span className="font-medium">
                        {selectedTrip._count?.deliveries || 0}/
                        {selectedTrip.maxPackages}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-md">
                      <BoxIcon className="h-5 w-5 text-gray-500 mb-1" />
                      <span className="text-xs text-gray-600">Volume</span>
                      <span className="font-medium">
                        {selectedTrip.availableSpace
                          ? `${selectedTrip.availableSpace}L`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-gray-50 rounded-md">
                      <Weight className="h-5 w-5 text-gray-500 mb-1" />
                      <span className="text-xs text-gray-600">Poids max</span>
                      <span className="font-medium">
                        {selectedTrip.maxWeight
                          ? `${selectedTrip.maxWeight}kg`
                          : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline">
                      <Link
                        href={`/admin/deliveries/create?tripId=${selectedTrip.id}`}
                      >
                        Reserver une livraison
                      </Link>
                    </Button>
                    <Button>
                      <Link href={`/admin/trips/${selectedTrip.id}/detail`}>
                        Voir les détails
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <div className="mt-8">
            <CustomPagination
              currentPage={paginationInfo.page}
              totalPages={paginationInfo.pages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
