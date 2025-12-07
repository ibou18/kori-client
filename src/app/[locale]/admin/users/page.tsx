"use client";

import { AdminListLayout } from "@/app/components/AdminListLayout";
import { OwnerInvitationModal } from "@/app/components/OwnerInvitationModal";
import { UserModal } from "@/app/components/UserModal";
import {
  useCreateUser,
  useDeleteUser,
  useGetUsers,
  useInviteOwner,
  useUpdateUser,
} from "@/app/data/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserStatusBadge } from "@/utils/statusUtils";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data, isLoading } = useGetUsers();
  const { mutate: deleteUser } = useDeleteUser();
  const { mutate: createUser } = useCreateUser();
  const { mutate: updateUser } = useUpdateUser();
  const { mutate: inviteOwner } = useInviteOwner();

  if (!session) {
    return (
      <p className="text-center mt-10">
        Connexion requise pour accéder à cette page!
      </p>
    );
  }

  // Normaliser les données - gérer les deux formats possibles
  const usersData = Array.isArray(data) ? data : data?.data || [];

  // Filtrer par rôle et statut
  const filteredData = usersData.filter((user: User) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    if (statusFilter !== "all") {
      const userStatus = user.isActive ? "ACTIVE" : "INACTIVE";
      if (userStatus !== statusFilter) return false;
    }
    return true;
  });

  const handleDelete = (user: User) => {
    deleteUser(user.id);
  };

  const handleView = (user: User) => {
    router.push(`/admin/users/${user.id}`);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleInviteOwner = () => {
    setIsInvitationModalOpen(true);
  };

  const handleInvitationSubmit = async (values: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    indicatif?: string;
  }) => {
    inviteOwner(values, {
      onSuccess: () => {
        setIsInvitationModalOpen(false);
      },
    });
  };

  const handleModalSubmit = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    indicatif?: string;
    role: "ADMIN" | "OWNER" | "CLIENT" | "EMPLOYEE" | "SYSTEM";
    isActive: boolean;
    password?: string;
    id?: string;
  }) => {
    if (editingUser) {
      // Mode édition
      const updateData: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        role: values.role,
        isActive: values.isActive,
      };

      // Ajouter les champs optionnels seulement s'ils sont définis
      if (values.phone !== undefined) {
        updateData.phone = values.phone || null;
      }
      if (values.indicatif !== undefined) {
        updateData.indicatif = values.indicatif || null;
      }
      if (values.password) {
        updateData.password = values.password;
      }

      updateUser(
        {
          id: editingUser.id,
          data: updateData,
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setEditingUser(null);
          },
        }
      );
    } else {
      // Mode création
      const createData: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        role: values.role,
        isActive: values.isActive,
        password: values.password || "",
      };

      // Ajouter les champs optionnels seulement s'ils sont définis
      if (values.phone) {
        createData.phone = values.phone;
      }
      if (values.indicatif) {
        createData.indicatif = values.indicatif;
      }

      createUser(createData, {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingUser(null);
        },
      });
    }
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
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <>
      <AdminListLayout
        title="Utilisateurs"
        data={filteredData}
        isLoading={isLoading}
        columns={columns}
        searchKeys={["firstName", "lastName", "email", "phone", "role"]}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        addButtonLabel="Ajouter un utilisateur"
        emptyMessage="Aucun utilisateur trouvé"
        filterComponent={
          <div className="flex flex-wrap gap-4 items-center">
            {filterComponent}
            <Button onClick={handleInviteOwner} variant="outline">
              Inviter un propriétaire
            </Button>
          </div>
        }
      />
      <UserModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingUser(null);
          }
        }}
        user={editingUser}
        onSubmit={handleModalSubmit}
      />
      <OwnerInvitationModal
        open={isInvitationModalOpen}
        onOpenChange={(open) => {
          setIsInvitationModalOpen(open);
        }}
        onSubmit={handleInvitationSubmit}
      />
    </>
  );
}
