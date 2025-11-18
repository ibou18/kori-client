"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { useGetBooking } from "@/app/data/hooks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingStatusBadge, PaymentStatusBadge } from "@/utils/statusUtils";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

interface BookedService {
  serviceName: string;
  serviceDescription?: string;
  price: number;
  discountPrice?: number;
  duration: number;
  serviceImageUrl?: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface Salon {
  id: string;
  name: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    province?: string;
  };
  phone?: string;
  email?: string;
}

interface Payment {
  total: number;
  subtotal: number;
  tax: number;
  paymentStatus: string;
}

interface Booking {
  id: string;
  status: string;
  paymentStatus?: string | null;
  appointmentStartDateTime: string;
  appointmentEndDateTime: string;
  duration: number;
  isHomeService: boolean;
  clientId: string;
  salonId: string;
  serviceAddressId?: string | null;
  clientNotes?: string;
  salonNotes?: string | null;
  paymentIntentId?: string | null;
  stripeSessionId?: string | null;
  paidAt?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  salon?: Salon;
  bookedServices?: BookedService[];
  payment?: Payment;
  actualPaidAmount?: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount / 100);
};

export default function BookingDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.id as string;

  const { data: bookingData, isLoading, error } = useGetBooking(bookingId);

  // Normaliser les données
  const booking: Booking | null = bookingData?.data || bookingData || null;

  if (!session) {
    return (
      <PageWrapper title="Détails de la réservation">
        <p className="text-center mt-10">
          Connexion requise pour accéder à cette page!
        </p>
      </PageWrapper>
    );
  }

  if (isLoading) {
    return (
      <PageWrapper title="Détails de la réservation">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !booking) {
    return (
      <PageWrapper title="Détails de la réservation">
        <div className="text-center mt-10">
          <p className="text-red-600 mb-4">
            {error
              ? "Erreur lors du chargement de la réservation"
              : "Réservation non trouvée"}
          </p>
          <Button
            onClick={() => router.push("/admin/bookings")}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const totalDuration =
    booking.bookedServices?.reduce(
      (sum, service) => sum + service.duration,
      0
    ) || booking.duration;

  return (
    <PageWrapper
      title={`Réservation #${booking.id.substring(0, 8)}`}
      description={`Détails de la réservation`}
      actions={
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/bookings")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
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
                <Calendar className="h-5 w-5" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <div className="mt-1">
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type de service</p>
                  <Badge
                    variant="outline"
                    className={`mt-1 ${
                      booking.isHomeService
                        ? "bg-[#F0F4F1] text-[#53745D] border-[#53745D]"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {booking.isHomeService ? "À domicile" : "Au salon"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {dayjs(booking.appointmentStartDateTime).format(
                        "dddd DD MMMM YYYY"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Heure</p>
                    <p className="font-medium">
                      {dayjs(booking.appointmentStartDateTime).format("HH:mm")}{" "}
                      - {dayjs(booking.appointmentEndDateTime).format("HH:mm")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Durée: {totalDuration} min
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Lieu</p>
                    {booking.isHomeService ? (
                      <p className="font-medium">Service à domicile</p>
                    ) : booking.salon?.address ? (
                      <div>
                        <p className="font-medium">{booking.salon.name}</p>
                        <p className="text-sm text-gray-600">
                          {booking.salon.address.street && (
                            <span>{booking.salon.address.street}, </span>
                          )}
                          {booking.salon.address.city}
                          {booking.salon.address.postalCode && (
                            <span> {booking.salon.address.postalCode}</span>
                          )}
                        </p>
                      </div>
                    ) : (
                      <p className="font-medium">
                        {booking.salon?.name || "N/A"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">ID Réservation</p>
                    <p className="font-mono text-sm font-medium break-all">
                      {booking.id}
                    </p>
                  </div>
                </div>
              </div>

              {booking.clientNotes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Notes du client</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">
                    {booking.clientNotes}
                  </p>
                </div>
              )}

              {booking.salonNotes && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Notes du salon</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">
                    {booking.salonNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services réservés */}
          {booking.bookedServices && booking.bookedServices.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Services réservés ({booking.bookedServices.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {booking.bookedServices.map((service, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50"
                    >
                      {service.serviceImageUrl && (
                        <Image
                          src={service.serviceImageUrl}
                          alt={service.serviceName}
                          width={80}
                          height={80}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {service.serviceName}
                        </h3>
                        {service.serviceDescription && (
                          <p className="text-sm text-gray-600 mt-1">
                            {service.serviceDescription}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-xs text-gray-500">
                            Durée: {service.duration} min
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {service.discountPrice ? (
                          <div>
                            <p className="text-lg font-bold text-[#53745D]">
                              {formatCurrency(service.discountPrice)}
                            </p>
                            <p className="text-sm text-gray-400 line-through">
                              {formatCurrency(service.price)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-[#53745D]">
                            {formatCurrency(service.price)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informations client */}
          {booking.client && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {booking.client.avatar ? (
                    <Image
                      src={booking.client.avatar}
                      alt={`${booking.client.firstName} ${booking.client.lastName}`}
                      width={60}
                      height={60}
                      className="h-15 w-15 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar className="h-15 w-15">
                      <AvatarFallback className="bg-[#F0F4F1] text-[#53745D]">
                        {booking.client.firstName.charAt(0)}
                        {booking.client.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {booking.client.firstName} {booking.client.lastName}
                    </h3>
                    <div className="flex flex-col xl:flex-row  gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600">
                          {booking.client.email}
                        </p>
                      </div>
                      {booking.client.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {booking.client.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/admin/users/${booking.clientId}`)
                    }
                  >
                    Voir le profil
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informations salon */}
          {booking.salon && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Salon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {booking.salon.name}
                    </h3>
                    {booking.salon.address && (
                      <div className="flex items-start gap-2 mt-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <p className="text-sm text-gray-600">
                          {booking.salon.address.street && (
                            <span>{booking.salon.address.street}, </span>
                          )}
                          {booking.salon.address.city}
                          {booking.salon.address.postalCode && (
                            <span> {booking.salon.address.postalCode}</span>
                          )}
                          {booking.salon.address.province && (
                            <span>, {booking.salon.address.province}</span>
                          )}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      {booking.salon.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {booking.salon.email}
                          </p>
                        </div>
                      )}
                      {booking.salon.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            {booking.salon.phone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(`/admin/salons/${booking.salonId}`)
                    }
                  >
                    Voir le salon
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Paiement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Statut du paiement</p>
                {booking.paymentStatus ? (
                  <PaymentStatusBadge status={booking.paymentStatus} />
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700">
                    Non défini
                  </Badge>
                )}
              </div>

              {booking.payment && (
                <>
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Sous-total</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(booking.payment.subtotal)}
                      </span>
                    </div>
                    {booking.payment.tax > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Taxes</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(booking.payment.tax)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-semibold text-gray-900">
                        Total
                      </span>
                      <span className="text-lg font-bold text-[#53745D]">
                        {formatCurrency(booking.payment.total)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {booking.actualPaidAmount !== undefined &&
                booking.actualPaidAmount !== null && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-[#53745D]">
                        Montant payé
                      </span>
                      <span className="text-lg font-bold text-[#53745D]">
                        {formatCurrency(booking.actualPaidAmount)}
                      </span>
                    </div>
                  </div>
                )}

              {booking.paidAt && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">Payé le</p>
                  <p className="text-sm font-medium">
                    {dayjs(booking.paidAt).format("DD MMM YYYY à HH:mm")}
                  </p>
                </div>
              )}

              {booking.paymentIntentId && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">Payment Intent ID</p>
                  <p className="text-xs font-mono break-all">
                    {booking.paymentIntentId}
                  </p>
                </div>
              )}

              {booking.stripeSessionId && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">Stripe Session ID</p>
                  <p className="text-xs font-mono break-all">
                    {booking.stripeSessionId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations système */}
          <Card>
            <CardHeader>
              <CardTitle>Informations système</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Date de création</p>
                <p className="text-sm font-medium">
                  {dayjs(booking.createdAt).format("DD MMM YYYY à HH:mm")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dernière modification</p>
                <p className="text-sm font-medium">
                  {dayjs(booking.updatedAt).format("DD MMM YYYY à HH:mm")}
                </p>
              </div>
              {booking.serviceAddressId && (
                <div>
                  <p className="text-sm text-gray-500">Adresse de service ID</p>
                  <p className="text-xs font-mono break-all">
                    {booking.serviceAddressId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/admin/bookings")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste
              </Button>
              {booking.clientId && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    router.push(`/admin/users/${booking.clientId}`)
                  }
                >
                  <User className="h-4 w-4 mr-2" />
                  Voir le client
                </Button>
              )}
              {booking.salonId && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    router.push(`/admin/salons/${booking.salonId}`)
                  }
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Voir le salon
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
