"use client";

import { AdminListLayout } from "@/app/components/AdminListLayout";
import { useGetUsers } from "@/app/data/hooks";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserStatusBadge } from "@/utils/statusUtils";
import { message } from "antd";
import dayjs from "dayjs";
import { Mail, Phone, User as UserIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  indicatif?: string;
  role: "ADMIN" | "OWNER" | "CLIENT" | "EMPLOYEE" | "SYSTEM";
  avatar?: string | null;
  isActive: boolean;
  isEmailVerified?: boolean;
  lastLogin?: string | null;
  stripeCustomerId?: string | null;
  stripeAccountId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading } = useGetUsers();

  if (!session) {
    return (
      <p className="text-center mt-10">
        Connexion requise pour accéder à cette page!
      </p>
    );
  }

  // Filtrer par rôle et statut
  const filteredData = data?.data?.filter((user: User) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    if (statusFilter !== "all") {
      const userStatus = user.isActive ? "ACTIVE" : "INACTIVE";
      if (userStatus !== statusFilter) return false;
    }
    return true;
  });

  const handleDelete = () => {
    // TODO: Implémenter la suppression d'utilisateur
    message.warning("La suppression d'utilisateur n'est pas encore disponible");
  };

  const handleView = (user: User) => {
    router.push(`/admin/users/${user.id}`);
  };

  const handleEdit = (user: User) => {
    router.push(`/admin/users/${user.id}/edit`);
  };

  const columns = [
    {
      key: "user",
      header: "Utilisateur",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#F0F4F1] flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-[#53745D]" />
            </div>
          )}
          <div>
            <div className="font-medium">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </div>
            {user.isEmailVerified === false && (
              <div className="text-xs text-yellow-600 mt-1">
                Email non vérifié
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Téléphone",
      render: (user: User) => (
        <div className="flex items-center gap-1 text-sm">
          {user.phone ? (
            <>
              <Phone className="h-3 w-3 text-gray-500" />
              <span>
                {user.indicatif && user.indicatif !== "+1"
                  ? user.indicatif
                  : ""}
                {user.phone}
              </span>
            </>
          ) : (
            <span className="text-gray-400">N/A</span>
          )}
        </div>
      ),
    },
    {
      key: "role",
      header: "Rôle",
      render: (user: User) => {
        const roleColors: Record<string, string> = {
          CLIENT: "bg-blue-50 text-blue-700",
          OWNER: "bg-purple-50 text-purple-700",
          ADMIN: "bg-red-50 text-red-700",
          EMPLOYEE: "bg-green-50 text-green-700",
          SYSTEM: "bg-gray-50 text-gray-700",
        };

        const roleLabels: Record<string, string> = {
          CLIENT: "Client",
          OWNER: "Propriétaire",
          ADMIN: "Administrateur",
          EMPLOYEE: "Employé",
          SYSTEM: "Système",
        };

        return (
          <Badge
            variant="outline"
            className={roleColors[user.role] || "bg-gray-50 text-gray-700"}
          >
            {roleLabels[user.role] || user.role}
          </Badge>
        );
      },
    },
    {
      key: "status",
      header: "Statut",
      render: (user: User) => (
        <div className="space-y-1">
          <UserStatusBadge isActive={user.isActive} />
          {user.isEmailVerified === false && (
            <div className="text-xs text-yellow-600">Email non vérifié</div>
          )}
        </div>
      ),
    },
    {
      key: "lastLogin",
      header: "Dernière connexion",
      render: (user: User) => (
        <div className="text-sm text-gray-600">
          {user.lastLogin ? (
            <>
              <div>{dayjs(user.lastLogin).format("DD MMM YYYY")}</div>
              <div className="text-xs text-gray-500">
                {dayjs(user.lastLogin).format("HH:mm")}
              </div>
            </>
          ) : (
            <span className="text-gray-400">Jamais</span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Créé le",
      render: (user: User) => (
        <div className="text-sm text-gray-600">
          {dayjs(user.createdAt).format("DD MMM YYYY")}
        </div>
      ),
    },
  ];

  const filterComponent = (
    <div className="flex flex-wrap gap-4">
      <Select value={roleFilter} onValueChange={setRoleFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrer par rôle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les rôles</SelectItem>
          <SelectItem value="CLIENT">Clients</SelectItem>
          <SelectItem value="OWNER">Propriétaires</SelectItem>
          <SelectItem value="EMPLOYEE">Employés</SelectItem>
          <SelectItem value="ADMIN">Administrateurs</SelectItem>
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrer par statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="ACTIVE">Actifs</SelectItem>
          <SelectItem value="INACTIVE">Inactifs</SelectItem>
          <SelectItem value="SUSPENDED">Suspendus</SelectItem>
          <SelectItem value="DELETED">Supprimés</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <AdminListLayout
      title="Utilisateurs"
      data={filteredData}
      isLoading={isLoading}
      columns={columns}
      searchKeys={["firstName", "lastName", "email", "phone", "role"]}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      emptyMessage="Aucun utilisateur trouvé"
      filterComponent={filterComponent}
    />
  );
}
