"use client";

import { AdminListLayout } from "@/app/components/AdminListLayout";
import { BookingDetailsModal } from "@/app/components/BookingDetailsModal";
import { GenericModal } from "@/app/components/GenericModal";
import { useGetBookings } from "@/app/data/hooks";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookingStatusBadge, PaymentStatusBadge } from "@/utils/statusUtils";
import { message } from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

export default function BookingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useGetBookings();

  if (!session) {
    return (
      <p className="text-center mt-10">
        Connexion requise pour accéder à cette page!
      </p>
    );
  }

  // Filtrer par statut
  const filteredData = data?.data?.filter((booking: Booking) => {
    if (statusFilter === "all") return true;
    return booking.status === statusFilter;
  });

  const handleDelete = () => {
    // TODO: Implémenter la suppression de réservation
    message.warning(
      "La suppression de réservation n'est pas encore disponible"
    );
  };

  const handleView = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  const handleEdit = (booking: Booking) => {
    router.push(`/admin/bookings/${booking.id}/edit`);
  };

  const columns = [
    {
      key: "client",
      header: "Client",
      render: (booking: Booking) => (
        <div>
          <div className="font-medium">
            {booking.client?.firstName} {booking.client?.lastName}
          </div>
          <div className="text-sm text-gray-600">{booking.client?.email}</div>
        </div>
      ),
    },
    {
      key: "salon",
      header: "Salon",
      render: (booking: Booking) => (
        <div className="font-medium">{booking.salon?.name || "N/A"}</div>
      ),
    },
    {
      key: "date",
      header: "Date & Heure",
      render: (booking: Booking) => (
        <div className="text-sm">
          <div className="font-medium">
            {dayjs(booking.appointmentStartDateTime).format("DD MMM YYYY")}
          </div>
          <div className="text-gray-600">
            {dayjs(booking.appointmentStartDateTime).format("HH:mm")} -{" "}
            {dayjs(booking.appointmentEndDateTime).format("HH:mm")}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (booking: Booking) => (
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {booking.isHomeService ? "À domicile" : "Au salon"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (booking: Booking) => (
        <BookingStatusBadge status={booking.status} />
      ),
    },
    {
      key: "payment",
      header: "Paiement",
      render: (booking: Booking) =>
        booking.paymentStatus ? (
          <PaymentStatusBadge status={booking.paymentStatus} />
        ) : (
          <span className="text-sm text-gray-500">N/A</span>
        ),
    },
    {
      key: "createdAt",
      header: "Créé le",
      render: (booking: Booking) => (
        <div className="text-sm text-gray-600">
          {dayjs(booking.createdAt).format("DD MMM YYYY")}
        </div>
      ),
    },
  ];

  const filterComponent = (
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filtrer par statut" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Toutes les réservations</SelectItem>
        <SelectItem value="DRAFT">Brouillons</SelectItem>
        <SelectItem value="PENDING">En attente</SelectItem>
        <SelectItem value="CONFIRMED">Confirmées</SelectItem>
        <SelectItem value="IN_PROGRESS">En cours</SelectItem>
        <SelectItem value="COMPLETED">Terminées</SelectItem>
        <SelectItem value="CANCELLED_BY_CLIENT">Annulées (Client)</SelectItem>
        <SelectItem value="CANCELLED_BY_PROVIDER">Annulées (Salon)</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <>
      <AdminListLayout
        title="Réservations"
        data={filteredData}
        isLoading={isLoading}
        columns={columns}
        searchKeys={["id", "status", "client", "salon"]}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="Aucune réservation trouvée"
        filterComponent={filterComponent}
      />
      <GenericModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Détails de la réservation"
        description="Informations complètes sur la réservation"
        size="2xl"
      >
        <BookingDetailsModal booking={selectedBooking} />
      </GenericModal>
    </>
  );
}
