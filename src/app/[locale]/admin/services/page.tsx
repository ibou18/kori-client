"use client";

import {
  useGetSalonServicesList,
  useDeleteSalonService,
} from "@/app/data/hooks";
import { AdminListLayout } from "@/app/components/AdminListLayout";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  isActive: boolean;
  salon?: {
    name: string;
  };
  category?: {
    name: string;
  };
  createdAt: string;
}

export default function ServicesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useGetSalonServicesList();
  const { mutate: deleteService } = useDeleteSalonService();

  if (!session) {
    return (
      <p className="text-center mt-10">
        Connexion requise pour accéder à cette page!
      </p>
    );
  }

  // Filtrer par statut
  const filteredData = data?.data?.filter((service: Service) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return service.isActive;
    if (statusFilter === "inactive") return !service.isActive;
    return true;
  });

  const handleDelete = (service: Service) => {
    deleteService(
      { serviceId: service.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["salon-services"] });
          message.success("Service supprimé avec succès");
        },
        onError: () => {
          message.error("Erreur lors de la suppression");
        },
      }
    );
  };

  const handleView = (service: Service) => {
    router.push(`/admin/services/${service.id}`);
  };

  const handleEdit = (service: Service) => {
    router.push(`/admin/services/${service.id}/edit`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount / 100); // Convertir de centimes si nécessaire
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const columns = [
    {
      key: "name",
      header: "Nom",
      render: (service: Service) => (
        <div>
          <div className="font-medium">{service.name}</div>
          {service.description && (
            <div className="text-sm text-gray-600 line-clamp-1">
              {service.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "salon",
      header: "Salon",
      render: (service: Service) => (
        <div className="font-medium">{service.salon?.name || "N/A"}</div>
      ),
    },
    {
      key: "category",
      header: "Catégorie",
      render: (service: Service) => (
        <Badge variant="outline" className="bg-gray-50">
          {service.category?.name || "N/A"}
        </Badge>
      ),
    },
    {
      key: "price",
      header: "Prix",
      render: (service: Service) => (
        <div className="font-semibold text-[#53745D]">
          {formatCurrency(service.price)}
        </div>
      ),
    },
    {
      key: "duration",
      header: "Durée",
      render: (service: Service) => (
        <div className="text-sm text-gray-600">
          {formatDuration(service.duration)}
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (service: Service) => (
        <Badge
          variant="outline"
          className={
            service.isActive
              ? "bg-[#F0F4F1] text-[#53745D] border-[#53745D]"
              : "bg-red-100 text-red-800 border-red-300"
          }
        >
          {service.isActive ? "Actif" : "Inactif"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Créé le",
      render: (service: Service) => (
        <div className="text-sm text-gray-600">
          {dayjs(service.createdAt).format("DD MMM YYYY")}
        </div>
      ),
    },
  ];

  const filterComponent = (
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filtrer par statut" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous les services</SelectItem>
        <SelectItem value="active">Actifs</SelectItem>
        <SelectItem value="inactive">Inactifs</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <AdminListLayout
      title="Services"
      data={filteredData}
      isLoading={isLoading}
      columns={columns}
      searchKeys={["name", "description", "salon.name", "category.name"]}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      addButtonLabel="Ajouter un service"
      emptyMessage="Aucun service trouvé"
      filterComponent={filterComponent}
    />
  );
}

