"use client";

import { useGetSalons, useDeleteSalon } from "@/app/data/hooks";
import { AdminListLayout } from "@/app/components/AdminListLayout";
import { SalonStatusBadge } from "@/utils/statusUtils";
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

interface Salon {
  id: string;
  name: string;
  phone: string;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  address?: {
    city?: string;
    street?: string;
  };
}

export default function SalonsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useGetSalons();
  const { mutate: deleteSalon } = useDeleteSalon();

  if (!session) {
    return (
      <p className="text-center mt-10">
        Connexion requise pour accéder à cette page!
      </p>
    );
  }

  // Filtrer par statut
  const filteredData = data?.data?.filter((salon: Salon) => {
    if (statusFilter === "active") return salon.isActive && salon.isVerified;
    if (statusFilter === "inactive") return !salon.isActive;
    if (statusFilter === "unverified") return !salon.isVerified;
    return true;
  });

  const handleDelete = (salon: Salon) => {
    deleteSalon(salon.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["salons"] });
        message.success("Salon supprimé avec succès");
      },
      onError: () => {
        message.error("Erreur lors de la suppression");
      },
    });
  };

  const handleView = (salon: Salon) => {
    router.push(`/admin/salons/${salon.id}`);
  };

  const handleEdit = (salon: Salon) => {
    router.push(`/admin/salons/${salon.id}/edit`);
  };

  const columns = [
    {
      key: "name",
      header: "Nom",
      render: (salon: Salon) => (
        <div className="font-medium">{salon.name}</div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (salon: Salon) => (
        <div className="text-sm text-gray-600">
          <div>{salon.email}</div>
          <div>{salon.phone}</div>
        </div>
      ),
    },
    {
      key: "location",
      header: "Localisation",
      render: (salon: Salon) => (
        <div className="text-sm text-gray-600">
          {salon.address?.city || "N/A"}
        </div>
      ),
    },
    {
      key: "rating",
      header: "Note",
      render: (salon: Salon) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{salon.rating?.toFixed(1) || "0.0"}</span>
          <span className="text-xs text-gray-500">
            ({salon.reviewCount || 0} avis)
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (salon: Salon) => (
        <SalonStatusBadge
          isActive={salon.isActive}
          isVerified={salon.isVerified}
        />
      ),
    },
    {
      key: "createdAt",
      header: "Créé le",
      render: (salon: Salon) => (
        <div className="text-sm text-gray-600">
          {dayjs(salon.createdAt).format("DD MMM YYYY")}
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
        <SelectItem value="all">Tous les salons</SelectItem>
        <SelectItem value="active">Actifs</SelectItem>
        <SelectItem value="inactive">Inactifs</SelectItem>
        <SelectItem value="unverified">Non vérifiés</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <AdminListLayout
      title="Salons"
      data={filteredData}
      isLoading={isLoading}
      columns={columns}
      searchKeys={["name", "email", "phone"]}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      addButtonLabel="Ajouter un salon"
      emptyMessage="Aucun salon trouvé"
      filterComponent={filterComponent}
    />
  );
}

