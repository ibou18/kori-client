"use client";

import { AdminListLayout } from "@/app/components/AdminListLayout";
import { useGetBookings } from "@/app/data/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingStatusBadge, PaymentStatusBadge } from "@/utils/statusUtils";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Payment {
  id: string;
  bookingId: string;
  status: string;
  amount: number;
  subtotal: number;
  tax: number;
  paidAt?: string;
  paymentIntentId?: string;
  amountPaidByClient?: number; // Montant réellement payé par le client (depuis Stripe)
  booking?: {
    id: string;
    status: string;
    appointmentStartDateTime: string;
    client?: {
      firstName: string;
      lastName: string;
    };
    salon?: {
      name: string;
    };
  };
  createdAt: string;
}

export default function PaymentsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: bookingsData, isLoading } = useGetBookings();

  if (!session) {
    return (
      <p className="text-center mt-10">
        Connexion requise pour accéder à cette page!
      </p>
    );
  }

  // Transformer les bookings en paiements en utilisant l'objet payment
  const payments: Payment[] =
    bookingsData?.data
      ?.filter((booking: any) => booking.payment) // Filtrer seulement les bookings avec un objet payment
      .map((booking: any) => {
        const payment = booking.payment;
        const total = payment?.total || 0;

        return {
          id: payment?.id || booking.paymentIntentId || booking.id,
          bookingId: booking.id,
          status: payment?.paymentStatus || booking.paymentStatus || "PENDING",
          amount: total,
          subtotal: payment?.subtotal || 0,
          tax: payment?.tax || 0,
          paidAt: payment?.paidAt || booking.paidAt,
          paymentIntentId: payment?.paymentIntentId || booking.paymentIntentId,
          amountPaidByClient: booking.actualPaidAmount ?? undefined, // Utiliser actualPaidAmount du serveur
          booking: {
            id: booking.id,
            status: booking.status,
            appointmentStartDateTime: booking.appointmentStartDateTime,
            client: booking.client,
            salon: booking.salon,
          },
          createdAt: payment?.createdAt || booking.createdAt,
        };
      }) || [];

  // Filtrer par statut
  const filteredData = payments.filter((payment) => {
    if (statusFilter === "all") return true;
    return payment.status === statusFilter;
  });

  const handleView = (payment: Payment) => {
    router.push(`/admin/bookings/${payment.bookingId}`);
  };

  const formatCurrency = (amount: number) => {
    // Les montants sont déjà en centimes dans la base de données
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount / 100);
  };

  const columns = [
    {
      key: "client",
      header: "Client",
      render: (payment: Payment) => (
        <div>
          <div className="font-medium">
            {payment.booking?.client?.firstName}{" "}
            {payment.booking?.client?.lastName}
          </div>
        </div>
      ),
    },
    {
      key: "salon",
      header: "Salon",
      render: (payment: Payment) => (
        <div className="font-medium">
          {payment.booking?.salon?.name || "N/A"}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Montant",
      render: (payment: Payment) => (
        <div>
          {payment.amountPaidByClient !== undefined && (
            <div className="text-xs font-semibold text-[#53745D] mt-1">
              Payé: {formatCurrency(payment.amountPaidByClient)}
            </div>
          )}
          <div className="font-medium text-[#53745D]">
            Total: {formatCurrency(payment.amount)}
          </div>

          {/* <div className="text-xs text-gray-500 mt-1">
            Sous-total: {formatCurrency(payment.subtotal)}
          </div> */}
          {/* {payment.tax > 0 && (
            <div className="text-xs text-gray-500">
              Taxes: {formatCurrency(payment.tax)}
            </div>
          )} */}
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (payment: Payment) => (
        <PaymentStatusBadge status={payment.status} />
      ),
    },
    {
      key: "bookingStatus",
      header: "Réservation",
      render: (payment: Payment) =>
        payment.booking ? (
          <BookingStatusBadge status={payment.booking.status} />
        ) : (
          <span className="text-sm text-gray-500">N/A</span>
        ),
    },
    {
      key: "date",
      header: "Date",
      render: (payment: Payment) => (
        <div className="text-sm">
          <div className="font-medium">
            {payment.paidAt
              ? dayjs(payment.paidAt).format("DD MMM YYYY")
              : dayjs(payment.createdAt).format("DD MMM YYYY")}
          </div>
          {payment.paidAt && (
            <div className="text-xs text-gray-500">
              {dayjs(payment.paidAt).format("HH:mm")}
            </div>
          )}
        </div>
      ),
    },
    // {
    //   key: "paymentId",
    //   header: "ID Paiement",
    //   render: (payment: Payment) => (
    //     <div className="text-xs font-mono text-gray-500">
    //       {payment.paymentIntentId ? (
    //         <Badge variant="outline" className="font-mono text-xs">
    //           {payment.paymentIntentId.slice(0, 20)}...
    //         </Badge>
    //       ) : (
    //         <span className="text-gray-400">N/A</span>
    //       )}
    //     </div>
    //   ),
    // },
  ];

  const filterComponent = (
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filtrer par statut" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous les paiements</SelectItem>
        <SelectItem value="PENDING">En attente</SelectItem>
        <SelectItem value="PAID">Payés</SelectItem>
        <SelectItem value="PARTIALLY_PAID">Partiellement payés</SelectItem>
        <SelectItem value="REFUNDED">Remboursés</SelectItem>
        <SelectItem value="FAILED">Échoués</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <AdminListLayout
      title="Paiements"
      data={filteredData}
      isLoading={isLoading}
      columns={columns}
      searchKeys={["id", "status", "paymentIntentId"]}
      onView={handleView}
      emptyMessage="Aucun paiement trouvé"
      filterComponent={filterComponent}
    />
  );
}
