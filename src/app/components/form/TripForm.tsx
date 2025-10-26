"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { X, Plus, Loader2, CalendarIcon, Clock } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useGetUsers, useCreateTrip, useUpdateTrip } from "@/app/data/hooksHop";
import { message } from "antd";
import { TripStatus, VehicleType } from "@/app/interfaceHop";
import { useSession } from "next-auth/react";
import { COUNTRIES, VEHICLE_TYPES } from "@/shared/constantes";
import { toast } from "sonner";

interface TripFormProps {
  mode?: "create" | "edit";
  trip?: any;
  isLoading?: boolean;
}

export function TripForm({ mode = "create", trip, isLoading }: TripFormProps) {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const { data: session }: any = useSession(); // Session next-auth

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    travelerId: session.user.id,
    startCity: " ",
    startCountry: " ",
    endCity: " ",
    endCountry: " ",
    waypoints: [] as string[],
    startTime: new Date(),
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // Default +2h
    price: 0,
    vehicleType: "CAR" as VehicleType,
    maxPackages: 1,
    availableSpace: 0,
    maxWeight: 0,
    qrCodeUrl: "",
    status: "SCHEDULED" as TripStatus,
  });

  const [newWaypoint, setNewWaypoint] = useState("");

  // Récupération des utilisateurs
  const { data: users = [], isLoading: loadingUsers } = useGetUsers();

  const { mutate: createTrip } = useCreateTrip();
  const { mutate: updateTrip } = useUpdateTrip();

  // Fonction pour obtenir la locale
  const getLocale = () => {
    return locale === "fr" ? fr : enUS;
  };
  console.log("session", session);
  // Pré-remplir le formulaire si on est en mode édition
  useEffect(() => {
    if (mode === "edit" && trip && !isLoading) {
      setFormData({
        travelerId: session.user.id,
        startCity: trip.startCity,
        startCountry: trip.startCountry,
        endCity: trip.endCity,
        endCountry: trip.endCountry,
        waypoints: trip.waypoints || [],
        startTime: new Date(trip.startTime),
        endTime: trip.endTime ? new Date(trip.endTime) : new Date(),
        price: trip.price || 0,
        vehicleType: trip.vehicleType,
        maxPackages: trip.maxPackages || 1,
        availableSpace: trip.availableSpace || 0,
        maxWeight: trip.maxWeight || 0,
        qrCodeUrl: trip.qrCodeUrl || "",
        status: trip.status,
      });
    }
  }, [mode, trip, isLoading, session]);

  // Gestion des waypoints
  const addWaypoint = () => {
    if (newWaypoint.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        waypoints: [...prev.waypoints, newWaypoint.trim()],
      }));
      setNewWaypoint("");
    }
  };

  const removeWaypoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      waypoints: prev.waypoints.filter((_, i) => i !== index),
    }));
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation de base
    if (!formData.travelerId) {
      toast.error("Veuillez sélectionner un voyageur");
      return;
    }

    if (!formData.startCity || !formData.endCity) {
      toast.error("Veuillez indiquer une ville de départ et d'arrivée");
      return;
    }

    if (!formData.startCountry || !formData.endCountry) {
      toast.error("Veuillez indiquer une adresse d'arrivée");
      return;
    }

    if (!formData.startTime) {
      toast.error("Veuillez indiquer une date/heure de départ");
      return;
    }

    setSubmitting(true);

    try {
      const formattedData = {
        ...formData,
        price: formData.price ? Number(formData.price) : undefined,
        availableSpace: formData.availableSpace
          ? Number(formData.availableSpace)
          : undefined,
        maxWeight: formData.maxWeight ? Number(formData.maxWeight) : undefined,
        maxPackages: Number(formData.maxPackages) || 1,
      };

      if (mode === "create") {
        createTrip(formattedData, {
          onSuccess: () => {
            toast.success("Trajet créé avec succès !");
            router.push("/admin/trips");
          },
          onError: (error: any) => {
            toast.error(
              error.formattedMessage || "Erreur lors de la création du trajet"
            );
          },
        });
      } else {
        await updateTrip(
          {
            id: trip.id,
            ...formattedData,
          },
          {
            onSuccess: () => {
              toast.success("Trajet mis à jour avec succès !");
              router.push("/admin/trips");
            },
            onError: (error: any) => {
              toast.error(
                error.formattedMessage ||
                  "Erreur lors de la mise à jour du trajet"
              );
            },
          }
        );
      }
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour gérer les changements dans les champs
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {mode === "create" ? "Créer un trajet" : "Modifier le trajet"}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Sélection du voyageur */}
          <div className="mb-6">
            <Label htmlFor="travelerId">Voyageur</Label>
            {loadingUsers ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Chargement des utilisateurs...</span>
              </div>
            ) : session?.user?.role === "ADMIN" ? (
              <Select
                value={formData.travelerId}
                onValueChange={(value) => handleChange("travelerId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un voyageur" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{session?.user?.name}</span>
                <span className="text-muted-foreground">
                  {session.user.firstName} - {session?.user?.email}
                </span>
              </div>
            )}
          </div>

          {/* Adresses de départ/arrivée */}
          {/* Adresses de départ/arrivée */}
          <div className="mb-6">
            <h3 className="text-md font-medium mb-3">Lieu de départ</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="startCity">Ville de départ</Label>
                <Input
                  id="startCity"
                  value={formData.startCity}
                  onChange={(e) => handleChange("startCity", e.target.value)}
                  placeholder="Paris"
                />
              </div>
              <div>
                <Label htmlFor="startCountry">Pays de départ</Label>
                <Select
                  value={formData.startCountry}
                  onValueChange={(value) => handleChange("startCountry", value)}
                >
                  <SelectTrigger id="startCountry">
                    <SelectValue placeholder="Sélectionnez un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <h3 className="text-md font-medium mb-3">Lieu d&apos;arrivée</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="endCity">Ville d&apos;arrivée</Label>
                <Input
                  id="endCity"
                  value={formData.endCity}
                  onChange={(e) => handleChange("endCity", e.target.value)}
                  placeholder="Montréal"
                />
              </div>
              <div>
                <Label htmlFor="endCountry">Pays d&apos;arrivée</Label>
                <Select
                  value={formData.endCountry}
                  onValueChange={(value) => handleChange("endCountry", value)}
                >
                  <SelectTrigger id="endCountry">
                    <SelectValue placeholder="Sélectionnez un pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Points intermédiaires (waypoints) */}
          <div className="mb-6">
            <Label>Points intermédiaires</Label>
            <div className="space-y-2 mt-2">
              {formData.waypoints.map((waypoint, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={waypoint} disabled className="bg-muted" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeWaypoint(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  value={newWaypoint}
                  onChange={(e) => setNewWaypoint(e.target.value)}
                  placeholder="Ajouter un point intermédiaire"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addWaypoint}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Dates et heures */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Date et heure de départ</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startTime ? (
                        format(formData.startTime, "PPP", {
                          locale: getLocale(),
                        })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startTime}
                      onSelect={(date) => {
                        if (date) {
                          const newDate = new Date(formData.startTime);
                          newDate.setFullYear(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate()
                          );
                          handleChange("startTime", newDate);
                        }
                      }}
                      locale={getLocale()}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {formData.startTime ? (
                        format(formData.startTime, "HH:mm")
                      ) : (
                        <span>Heure</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={
                            formData.startTime
                              ? format(formData.startTime, "HH")
                              : "12"
                          }
                          onValueChange={(hour) => {
                            const newDate = new Date(formData.startTime);
                            newDate.setHours(parseInt(hour, 10));
                            handleChange("startTime", newDate);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Heures" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem
                                key={i}
                                value={i.toString().padStart(2, "0")}
                              >
                                {i.toString().padStart(2, "0")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={
                            formData.startTime
                              ? format(formData.startTime, "mm")
                              : "00"
                          }
                          onValueChange={(minute) => {
                            const newDate = new Date(formData.startTime);
                            newDate.setMinutes(parseInt(minute, 10));
                            handleChange("startTime", newDate);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Minutes" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i * 5).map(
                              (minute) => (
                                <SelectItem
                                  key={minute}
                                  value={minute.toString().padStart(2, "0")}
                                >
                                  {minute.toString().padStart(2, "0")}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label>Date et heure d&apos;arrivée (optionnel)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endTime ? (
                        format(formData.endTime, "PPP", { locale: getLocale() })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endTime || undefined}
                      onSelect={(date) => {
                        if (date) {
                          if (!formData.endTime) {
                            const newDate = new Date();
                            newDate.setFullYear(
                              date.getFullYear(),
                              date.getMonth(),
                              date.getDate()
                            );
                            handleChange("endTime", newDate);
                          } else {
                            const newDate = new Date(formData.endTime);
                            newDate.setFullYear(
                              date.getFullYear(),
                              date.getMonth(),
                              date.getDate()
                            );
                            handleChange("endTime", newDate);
                          }
                        } else {
                          handleChange("endTime", null);
                        }
                      }}
                      locale={getLocale()}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      disabled={!formData.endTime}
                    >
                      <Clock className="mr-2 h-4 w-4" />
                      {formData.endTime ? (
                        format(formData.endTime, "HH:mm")
                      ) : (
                        <span>Heure</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={
                            formData.endTime
                              ? format(formData.endTime, "HH")
                              : "14"
                          }
                          onValueChange={(hour) => {
                            let newDate = new Date();
                            if (formData.endTime) {
                              newDate = new Date(formData.endTime);
                            }
                            newDate.setHours(parseInt(hour, 10));
                            handleChange("endTime", newDate);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Heures" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem
                                key={i}
                                value={i.toString().padStart(2, "0")}
                              >
                                {i.toString().padStart(2, "0")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={
                            formData.endTime
                              ? format(formData.endTime, "mm")
                              : "00"
                          }
                          onValueChange={(minute) => {
                            let newDate = new Date();
                            if (formData.endTime) {
                              newDate = new Date(formData.endTime);
                            }
                            newDate.setMinutes(parseInt(minute, 10));
                            handleChange("endTime", newDate);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Minutes" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i * 5).map(
                              (minute) => (
                                <SelectItem
                                  key={minute}
                                  value={minute.toString().padStart(2, "0")}
                                >
                                  {minute.toString().padStart(2, "0")}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Type de véhicule */}
          <div className="mb-6">
            <Label htmlFor="vehicleType">Type de véhicule</Label>
            <Select
              value={formData.vehicleType}
              onValueChange={(value: VehicleType) =>
                handleChange("vehicleType", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type de véhicule" />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_TYPES.map((vehicle) => (
                  <SelectItem key={vehicle.value} value={vehicle.value}>
                    {vehicle.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Contraintes de chargement */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="maxPackages">Nombre max de colis</Label>
              <Input
                id="maxPackages"
                type="number"
                value={formData.maxPackages}
                min={1}
                onChange={(e) =>
                  handleChange("maxPackages", parseInt(e.target.value) || 1)
                }
              />
            </div>
            <div>
              <Label htmlFor="availableSpace">Espace disponible (litres)</Label>
              <Input
                id="availableSpace"
                type="number"
                step="0.1"
                value={formData.availableSpace}
                onChange={(e) =>
                  handleChange(
                    "availableSpace",
                    parseFloat(e.target.value) || 0
                  )
                }
              />
            </div>
            <div>
              <Label htmlFor="maxWeight">Poids max (kg)</Label>
              <Input
                id="maxWeight"
                type="number"
                step="0.1"
                value={formData.maxWeight}
                onChange={(e) =>
                  handleChange("maxWeight", parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>

          {/* Prix */}
          <div className="mb-6">
            <Label htmlFor="price">Prix (optionnel)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                handleChange("price", parseFloat(e.target.value) || 0)
              }
              placeholder="Prix demandé pour le transport"
            />
          </div>

          {/* QR Code URL */}
          <div className="mb-6">
            <Label htmlFor="qrCodeUrl">URL du QR Code (optionnel)</Label>
            <Input
              id="qrCodeUrl"
              value={formData.qrCodeUrl}
              onChange={(e) => handleChange("qrCodeUrl", e.target.value)}
              placeholder="https://exemple.com/qrcode/123"
            />
          </div>

          {/* Status */}
          <div className="mb-6">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value: TripStatus) =>
                handleChange("status", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHEDULED">Programmé</SelectItem>
                <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                <SelectItem value="COMPLETED">Terminé</SelectItem>
                <SelectItem value="CANCELED">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/trips")}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Création..." : "Modification..."}
                </>
              ) : mode === "create" ? (
                "Créer le trajet"
              ) : (
                "Mettre à jour le trajet"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
