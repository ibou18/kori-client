"use client";

import { BookingStatusBadge, PaymentStatusBadge } from "@/utils/statusUtils";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import { Calendar, Clock, MapPin, User, Building2, CreditCard } from "lucide-react";

interface Booking {
  id: string;
  status: string;
  paymentStatus?: string;
  appointmentStartDateTime: string;
  appointmentEndDateTime: string;
  isHomeService: boolean;
  client?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  salon?: {
    name: string;
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
    };
  };
  bookedServices?: Array<{
    serviceName: string;
    serviceDescription?: string;
    price: number;
    discountPrice?: number;
    duration: number;
  }>;
  payment?: {
    total: number;
    subtotal: number;
    tax: number;
    paymentStatus: string;
  };
  actualPaidAmount?: number;
  createdAt: string;
}

interface BookingDetailsModalProps {
  booking: Booking | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount / 100);
};

export function BookingDetailsModal({ booking }: BookingDetailsModalProps) {
  if (!booking) return null;

  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-[#53745D]" />
            <h3 className="font-semibold text-gray-900">Client</h3>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {booking.client?.firstName} {booking.client?.lastName}
            </p>
            <p className="text-sm text-gray-600">{booking.client?.email}</p>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-[#53745D]" />
            <h3 className="font-semibold text-gray-900">Salon</h3>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">
              {booking.salon?.name || "N/A"}
            </p>
            {booking.salon?.address && (
              <p className="text-sm text-gray-600">
                {booking.salon.address.street && (
                  <span>{booking.salon.address.street}, </span>
                )}
                {booking.salon.address.city}
                {booking.salon.address.postalCode && (
                  <span> {booking.salon.address.postalCode}</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Date et heure */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-[#53745D]" />
          <h3 className="font-semibold text-gray-900">Date et heure</h3>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {dayjs(booking.appointmentStartDateTime).format(
                  "dddd DD MMMM YYYY"
                )}
              </p>
              <p className="text-sm text-gray-600">
                {dayjs(booking.appointmentStartDateTime).format("HH:mm")} -{" "}
                {dayjs(booking.appointmentEndDateTime).format("HH:mm")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <Badge
              variant="outline"
              className={
                booking.isHomeService
                  ? "bg-[#F0F4F1] text-[#53745D]"
                  : "bg-blue-50 text-blue-700"
              }
            >
              {booking.isHomeService ? "À domicile" : "Au salon"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Services */}
      {booking.bookedServices && booking.bookedServices.length > 0 && (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Services</h3>
          <div className="space-y-3">
            {booking.bookedServices.map((service, index) => (
              <div
                key={index}
                className="flex justify-between items-start border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {service.serviceName}
                  </p>
                  {service.serviceDescription && (
                    <p className="text-xs text-gray-600 mt-1">
                      {service.serviceDescription}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Durée: {service.duration} min
                  </p>
                </div>
                <div className="text-right ml-4">
                  {service.discountPrice ? (
                    <div>
                      <p className="text-sm font-semibold text-[#53745D]">
                        {formatCurrency(service.discountPrice)}
                      </p>
                      <p className="text-xs text-gray-400 line-through">
                        {formatCurrency(service.price)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-[#53745D]">
                      {formatCurrency(service.price)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paiement */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-4 w-4 text-[#53745D]" />
          <h3 className="font-semibold text-gray-900">Paiement</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Statut</span>
            {booking.paymentStatus ? (
              <PaymentStatusBadge status={booking.paymentStatus} />
            ) : (
              <span className="text-sm text-gray-500">N/A</span>
            )}
          </div>
          {booking.payment && (
            <>
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
                <span className="text-sm font-bold text-[#53745D]">
                  {formatCurrency(booking.payment.total)}
                </span>
              </div>
              {booking.actualPaidAmount !== undefined &&
                booking.actualPaidAmount !== null && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-medium text-[#53745D]">
                      Montant payé
                    </span>
                    <span className="text-sm font-bold text-[#53745D]">
                      {formatCurrency(booking.actualPaidAmount)}
                    </span>
                  </div>
                )}
            </>
          )}
        </div>
      </div>

      {/* Statut de la réservation */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-900">
            Statut de la réservation
          </span>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Créée le {dayjs(booking.createdAt).format("DD MMMM YYYY à HH:mm")}
        </p>
      </div>
    </div>
  );
}

