"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { useGetSalon } from "@/app/data/hooks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SalonStatusBadge } from "@/utils/statusUtils";
import dayjs from "dayjs";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Edit,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Shield,
  Star,
  User,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

interface Address {
  id: string;
  street?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  country?: string;
}

interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
}

interface SalonPhoto {
  id: string;
  url: string;
  alt?: string;
  order: number;
  isMain?: boolean;
}

interface SalonHoliday {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

interface SalonService {
  id: string;
  name: string;
  description?: string;
  duration: number;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  };
}

interface Salon {
  id: string;
  name: string;
  description?: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  reviewCount: number;
  timezone: string;
  salonTypes?: string[];
  openingHours?: any;
  isActive: boolean;
  isVerified: boolean;
  offersHomeService: boolean;
  stripeAccountId?: string | null;
  stripeConnectEnabled?: boolean;
  commissionRate?: number;
  dashboardUrl?: string | null;
  providerCancellationCount?: number;
  lastProviderCancellation?: string | null;
  visibilityReduced?: boolean;
  accountSuspended?: boolean;
  suspensionReason?: string | null;
  suspensionEndDate?: string | null;
  createdAt: string;
  updatedAt: string;
  address?: Address;
  owner?: Owner;
  employees?: Employee[];
  photos?: SalonPhoto[];
  holidays?: SalonHoliday[];
  services?: SalonService[];
}

export default function SalonDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const salonId = params?.id as string;

  const { data: salonData, isLoading, error } = useGetSalon(salonId);

  // Normaliser les données
  const salon: Salon | null = salonData?.data || salonData || null;

  if (!session) {
    return (
      <PageWrapper title="Détails du salon">
        <p className="text-center mt-10">
          Connexion requise pour accéder à cette page!
        </p>
      </PageWrapper>
    );
  }

  if (isLoading) {
    return (
      <PageWrapper title="Détails du salon">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !salon) {
    return (
      <PageWrapper title="Détails du salon">
        <div className="text-center mt-10">
          <p className="text-red-600 mb-4">
            {error ? "Erreur lors du chargement du salon" : "Salon non trouvé"}
          </p>
          <Button
            onClick={() => router.push("/admin/salons")}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const mainPhoto = salon.photos?.find((p) => p.isMain) || salon.photos?.[0];

  const formatOpeningHours = (hours: any) => {
    if (!hours) return null;
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const dayLabels: Record<string, string> = {
      monday: "Lundi",
      tuesday: "Mardi",
      wednesday: "Mercredi",
      thursday: "Jeudi",
      friday: "Vendredi",
      saturday: "Samedi",
      sunday: "Dimanche",
    };

    return days.map((day) => {
      const dayHours = hours[day];
      if (!dayHours || dayHours === null) {
        return { day: dayLabels[day], hours: "Fermé" };
      }
      return {
        day: dayLabels[day],
        hours: `${dayHours.open} - ${dayHours.close}`,
      };
    });
  };

  const openingHoursList = salon.openingHours
    ? formatOpeningHours(salon.openingHours)
    : null;

  return (
    <PageWrapper
      title={salon.name}
      description={`Détails du salon`}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/salons")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button onClick={() => router.push(`/admin/salons/${salon.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                {mainPhoto ? (
                  <Image
                    src={mainPhoto.url}
                    alt={mainPhoto.alt || salon.name}
                    width={120}
                    height={120}
                    className="h-30 w-30 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-30 w-30 rounded-lg bg-gray-200 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{salon.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <SalonStatusBadge
                      isActive={salon.isActive}
                      isVerified={salon.isVerified}
                    />
                    {salon.offersHomeService && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        Service à domicile
                      </Badge>
                    )}
                  </div>
                  {salon.description && (
                    <p className="text-gray-600 mt-3">{salon.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{salon.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Téléphone</p>
                    <p className="font-medium">{salon.phone}</p>
                  </div>
                </div>

                {salon.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Site web</p>
                      <a
                        href={salon.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {salon.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Fuseau horaire</p>
                    <p className="font-medium">{salon.timezone}</p>
                  </div>
                </div>

                {salon.address && (
                  <div className="flex items-start gap-3 col-span-1 md:col-span-2">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Adresse</p>
                      <p className="font-medium">
                        {salon.address.street && (
                          <span>{salon.address.street}, </span>
                        )}
                        {salon.address.city}
                        {salon.address.postalCode && (
                          <span> {salon.address.postalCode}</span>
                        )}
                        {salon.address.province && (
                          <span>, {salon.address.province}</span>
                        )}
                        {salon.address.country && (
                          <span>, {salon.address.country}</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {salon.salonTypes && salon.salonTypes.length > 0 && (
                  <div className="flex items-start gap-3 col-span-1 md:col-span-2">
                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Types de salon</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {salon.salonTypes.map((type, index) => (
                          <Badge key={index} variant="outline">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Horaires d'ouverture */}
          {openingHoursList && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horaires d'ouverture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {openingHoursList.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b last:border-0"
                    >
                      <span className="font-medium">{item.day}</span>
                      <span
                        className={
                          item.hours === "Fermé"
                            ? "text-gray-400"
                            : "text-gray-900"
                        }
                      >
                        {item.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photos */}
          {salon.photos && salon.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Photos ({salon.photos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {salon.photos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square">
                      <Image
                        src={photo.url}
                        alt={photo.alt || salon.name}
                        fill
                        className="rounded-lg object-cover"
                      />
                      {photo.isMain && (
                        <Badge
                          className="absolute top-2 right-2"
                          variant="default"
                        >
                          Principale
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services */}
          {salon.services && salon.services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Services ({salon.services.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salon.services.slice(0, 10).map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{service.name}</h3>
                          {!service.isActive && (
                            <Badge
                              variant="outline"
                              className="bg-gray-50 text-gray-500"
                            >
                              Inactif
                            </Badge>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          {service.category && (
                            <Badge variant="outline" className="text-xs">
                              {service.category.name}
                            </Badge>
                          )}
                          <p className="text-xs text-gray-500">
                            Durée: {service.duration} min
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {salon.services.length > 10 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{salon.services.length - 10} autres services
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Employés */}
          {salon.employees && salon.employees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employés ({salon.employees.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {salon.employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/admin/users/${employee.id}`)}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {employee.firstName.charAt(0)}
                          {employee.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {employee.firstName} {employee.lastName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {employee.email}
                        </p>
                      </div>
                      <ArrowLeft className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vacances */}
          {salon.holidays && salon.holidays.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Vacances ({salon.holidays.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salon.holidays.map((holiday) => (
                    <div
                      key={holiday.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {dayjs(holiday.startDate).format("DD MMM YYYY")} -{" "}
                          {dayjs(holiday.endDate).format("DD MMM YYYY")}
                        </p>
                        {holiday.reason && (
                          <p className="text-sm text-gray-600 mt-1">
                            {holiday.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Propriétaire */}
          {salon.owner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Propriétaire
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {salon.owner.avatar ? (
                    <Image
                      src={salon.owner.avatar}
                      alt={`${salon.owner.firstName} ${salon.owner.lastName}`}
                      width={50}
                      height={50}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar>
                      <AvatarFallback>
                        {salon.owner.firstName.charAt(0)}
                        {salon.owner.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {salon.owner.firstName} {salon.owner.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{salon.owner.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => router.push(`/admin/users/${salon.owner?.id}`)}
                >
                  Voir le profil
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Note moyenne</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold">
                    {salon.rating?.toFixed(1) || "0.0"}
                  </span>
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Nombre d'avis</span>
                <span className="font-bold">{salon.reviewCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Services</span>
                <span className="font-bold">{salon.services?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Employés</span>
                <span className="font-bold">
                  {salon.employees?.length || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Photos</span>
                <span className="font-bold">{salon.photos?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Informations système */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Informations système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">ID Salon</p>
                <p className="font-mono text-xs font-medium break-all">
                  {salon.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <div className="mt-1">
                  <SalonStatusBadge
                    isActive={salon.isActive}
                    isVerified={salon.isVerified}
                  />
                </div>
              </div>

              {salon.accountSuspended && (
                <div>
                  <p className="text-sm text-gray-500">Compte suspendu</p>
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Suspendu
                  </Badge>
                  {salon.suspensionReason && (
                    <p className="text-xs text-gray-600 mt-1">
                      {salon.suspensionReason}
                    </p>
                  )}
                  {salon.suspensionEndDate && (
                    <p className="text-xs text-gray-600 mt-1">
                      Jusqu'au:{" "}
                      {dayjs(salon.suspensionEndDate).format("DD MMM YYYY")}
                    </p>
                  )}
                </div>
              )}

              {salon.visibilityReduced && (
                <div>
                  <p className="text-sm text-gray-500">Visibilité</p>
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 border-yellow-200"
                  >
                    Visibilité réduite
                  </Badge>
                </div>
              )}

              {salon.providerCancellationCount !== undefined &&
                salon.providerCancellationCount > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Annulations</p>
                    <p className="font-medium">
                      {salon.providerCancellationCount} annulation(s)
                    </p>
                    {salon.lastProviderCancellation && (
                      <p className="text-xs text-gray-500 mt-1">
                        Dernière:{" "}
                        {dayjs(salon.lastProviderCancellation).format(
                          "DD MMM YYYY"
                        )}
                      </p>
                    )}
                  </div>
                )}

              <div>
                <p className="text-sm text-gray-500">Date de création</p>
                <p className="text-sm font-medium">
                  {dayjs(salon.createdAt).format("DD MMM YYYY à HH:mm")}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Dernière modification</p>
                <p className="text-sm font-medium">
                  {dayjs(salon.updatedAt).format("DD MMM YYYY à HH:mm")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stripe */}
          {(salon.stripeAccountId ||
            salon.stripeConnectEnabled !== undefined) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Stripe Connect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {salon.stripeAccountId && (
                  <div>
                    <p className="text-sm text-gray-500">Account ID</p>
                    <p className="font-mono text-xs font-medium break-all">
                      {salon.stripeAccountId}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <Badge
                    variant="outline"
                    className={
                      salon.stripeConnectEnabled
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }
                  >
                    {salon.stripeConnectEnabled ? "Activé" : "Non activé"}
                  </Badge>
                </div>

                {salon.commissionRate !== undefined && (
                  <div>
                    <p className="text-sm text-gray-500">Commission</p>
                    <p className="font-medium">
                      {(salon.commissionRate * 100).toFixed(1)}%
                    </p>
                  </div>
                )}

                {salon.dashboardUrl && (
                  <div>
                    <p className="text-sm text-gray-500">Dashboard</p>
                    <a
                      href={salon.dashboardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Ouvrir le dashboard
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/admin/salons")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste
              </Button>
              <Button
                className="w-full"
                onClick={() => router.push(`/admin/salons/${salon.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier le salon
              </Button>
              {salon.owner && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/admin/users/${salon.owner?.id}`)}
                >
                  <User className="h-4 w-4 mr-2" />
                  Voir le propriétaire
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
