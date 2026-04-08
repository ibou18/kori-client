"use client";

import { BookingDetailsModal } from "@/app/components/BookingDetailsModal";
import { GenericModal } from "@/app/components/GenericModal";
import { useGetClientBookings } from "@/app/data/hooks";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge, PaymentStatusBadge } from "@/utils/statusUtils";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { CLIENT } from "@/shared/constantes";
import { useMemo, useState } from "react";

interface Booking {
  id: string;
  status: string;
  paymentStatus?: string;
  appointmentStartDateTime: string;
  appointmentEndDateTime: string;
  isHomeService: boolean;
  salon?: {
    id?: string;
    name: string;
    address?: {
      street?: string;
      city?: string;
      postalCode?: string;
    };
  };
  bookedServices?: Array<{
    serviceName: string;
    duration: number;
  }>;
  payment?: {
    total: number;
    paymentStatus: string;
  };
  createdAt: string;
}

function formatCadFromCents(cents: number | undefined | null): string {
  if (cents === undefined || cents === null) return "—";
  return new Intl.NumberFormat("fr-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function BookingCard({
  booking,
  locale,
  onOpen,
}: {
  booking: Booking;
  locale: string;
  onOpen: () => void;
}) {
  const salonLink =
    booking.salon?.id != null
      ? `/${locale}/salon/${booking.salon.id}`
      : undefined;
  const serviceName = booking.bookedServices?.[0]?.serviceName;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-slate-900">
            {salonLink ? (
              <Link href={salonLink} className="text-[#53745D] hover:underline">
                {booking.salon?.name || "Salon"}
              </Link>
            ) : (
              booking.salon?.name || "Salon"
            )}
          </p>
          {serviceName && (
            <p className="text-sm text-slate-600 mt-0.5">{serviceName}</p>
          )}
          <p className="text-sm text-slate-700 mt-2">
            <span className="font-medium">
              {dayjs(booking.appointmentStartDateTime).format(
                "ddd D MMM YYYY · HH:mm",
              )}
            </span>
            {" — "}
            {dayjs(booking.appointmentEndDateTime).format("HH:mm")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BookingStatusBadge status={booking.status} />
          {booking.paymentStatus && (
            <PaymentStatusBadge status={booking.paymentStatus} />
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="text-sm tabular-nums text-slate-600">
          {formatCadFromCents(booking.payment?.total)}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-[#53745D] text-[#53745D] hover:bg-[#F0F4F1]"
          onClick={onOpen}
        >
          Détails et gestion
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  bookings,
  locale,
  onSelect,
  empty,
}: {
  title: string;
  bookings: Booking[];
  locale: string;
  onSelect: (b: Booking) => void;
  empty: string;
}) {
  if (bookings.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        <p className="text-sm text-slate-500">{empty}</p>
      </section>
    );
  }
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      <div className="space-y-3">
        {bookings.map((b) => (
          <BookingCard
            key={b.id}
            booking={b}
            locale={locale}
            onOpen={() => onSelect(b)}
          />
        ))}
      </div>
    </section>
  );
}

export default function MesRendezVousPage() {
  const params = useParams();
  const locale = (params.locale as string) || "fr";
  const { data: session, status } = useSession();
  const clientId = (session?.user as { id?: string } | undefined)?.id;
  const { data: apiPayload, isLoading } = useGetClientBookings(clientId ?? "", {
    limit: 50,
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const lists = useMemo(() => {
    const body = apiPayload as
      | {
          data?: {
            upcoming?: Booking[];
            past?: Booking[];
            cancelled?: Booking[];
          };
        }
      | null
      | undefined;
    const d = body?.data;
    return {
      upcoming: d?.upcoming ?? [],
      past: d?.past ?? [],
      cancelled: d?.cancelled ?? [],
    };
  }, [apiPayload]);

  const callbackUrl = `/${locale}/mes-rendez-vous`;

  if (status === "loading") {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-slate-600">
        <Loader2 className="h-6 w-6 animate-spin text-[#53745D]" />
        Chargement…
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900 mb-2">
          Connexion requise
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          Connectez-vous pour voir et gérer vos rendez-vous.
        </p>
        <Button
          asChild
          className="bg-[#53745D] hover:bg-[#4A6854] text-white w-full"
        >
          <Link
            href={`/${locale}/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          >
            Se connecter
          </Link>
        </Button>
      </div>
    );
  }

  if ((session?.user as { role?: string } | undefined)?.role !== CLIENT) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-900">
        Cette page est réservée aux comptes client Korí.
      </div>
    );
  }

  const openDetails = (b: Booking) => {
    setSelectedBooking(b);
    setModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Mes rendez-vous</h1>
        <p className="text-sm text-slate-600 mt-1">
          Consultez vos réservations à venir, passées ou annulées.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin text-[#53745D]" />
          Chargement de vos réservations…
        </div>
      ) : (
        <div className="space-y-10">
          <Section
            title="À venir"
            bookings={lists.upcoming}
            locale={locale}
            onSelect={openDetails}
            empty="Aucun rendez-vous à venir."
          />
          <Section
            title="Passés"
            bookings={lists.past}
            locale={locale}
            onSelect={openDetails}
            empty="Aucun rendez-vous passé."
          />
          <Section
            title="Annulés"
            bookings={lists.cancelled}
            locale={locale}
            onSelect={openDetails}
            empty="Aucune réservation annulée."
          />
        </div>
      )}

      <GenericModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Détails de la réservation"
        description="Informations sur votre rendez-vous"
        size="2xl"
      >
        {/* Types API allégés vs modal détail — cast pour réutiliser le modal existant */}
        <BookingDetailsModal booking={selectedBooking as never} />
      </GenericModal>
    </div>
  );
}
