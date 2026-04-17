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
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [cityDraft, setCityDraft] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const t = setTimeout(() => setCityFilter(cityDraft.trim()), 400);
    return () => clearTimeout(t);
  }, [cityDraft]);

  useEffect(() => {
    setCurrentPage(1);
  }, [cityFilter]);

  const [searchDraft, setSearchDraft] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchDraft.trim()), 400);
    return () => clearTimeout(t);
  }, [searchDraft]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Calculer limit et offset pour la pagination côté serveur
  const limit = itemsPerPage;
  const offset = (currentPage - 1) * itemsPerPage;

  // Préparer les paramètres pour l'API selon le filtre
  const apiParams: {
    limit: number;
    offset: number;
    isActive?: boolean;
    isVerified?: boolean;
    city?: string;
    search?: string;
  } = {
    limit,
    offset,
  };

  if (cityFilter) {
    apiParams.city = cityFilter;
  }

  if (debouncedSearch) {
    apiParams.search = debouncedSearch;
  }

  // Appliquer les filtres côté serveur
  if (statusFilter === "active") {
    apiParams.isActive = true;
    apiParams.isVerified = true;
  } else if (statusFilter === "inactive") {
    apiParams.isActive = false;
  } else if (statusFilter === "unverified") {
    apiParams.isVerified = false;
  }

  const { data, isLoading } = useGetSalons(apiParams);
  const { mutate: deleteSalon } = useDeleteSalon();

  if (!session) {
    return (
      <p className="text-center mt-10">
        Connexion requise pour accéder à cette page!
      </p>
    );
  }

  // Les données sont déjà filtrées côté serveur
  const filteredData = data?.data || [];

  // Total depuis la réponse de l'API
  const totalItems = data?.pagination?.total || 0;

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

  const handleAdd = () => {
    router.push("/admin/salons/new");
  };

  const columns = [
    {
      key: "name",
      header: "Nom",
      render: (salon: Salon) => <div className="font-medium">{salon.name}</div>,
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
          <span className="font-medium">
            {salon.rating?.toFixed(1) || "0.0"}
          </span>
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
    <>
      <Select
        value={statusFilter}
        onValueChange={(value: string) => {
          setStatusFilter(value);
          setCurrentPage(1);
        }}
      >
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
      <div className="flex flex-row gap-1.5 min-w-[200px] items-center">
        <Label
          htmlFor="admin-salons-city"
          className="text-xs text-muted-foreground"
        >
          Ville
        </Label>
        <Input
          id="admin-salons-city"
          placeholder="Ex. Montréal, Gatineau…"
          value={cityDraft}
          onChange={(e) => setCityDraft(e.target.value)}
          className="w-[220px]"
        />
      </div>
    </>
  );

  return (
    <AdminListLayout
      title="Salons"
      data={filteredData}
      isLoading={isLoading}
      columns={columns}
      searchKeys={["name", "email", "phone"]}
      controlledSearch={{
        value: searchDraft,
        onChange: setSearchDraft,
      }}
      searchPlaceholder="Nom, email ou téléphone (chiffres sans espaces possibles)…"
      onAdd={handleAdd}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      addButtonLabel="Ajouter un salon"
      emptyMessage="Aucun salon trouvé"
      filterComponent={filterComponent}
      itemsPerPage={itemsPerPage}
      totalItems={totalItems}
      currentPage={currentPage}
      serverSidePagination={true}
      onPageChange={(page) => {
        setCurrentPage(page);
        // Scroll vers le haut lors du changement de page
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );
}
