"use client";
import { useState } from "react";
import FormAddUser from "@/app/components/form/FormAddUser";
import { useDeleteUser, useGetUsers, useInviteUser } from "@/app/data/hooks";
import { Modal, message } from "antd";
import { EditIcon, Plus, Settings, Trash2Icon } from "lucide-react";
import { ADMIN, OWNER } from "@/shared/constantes";
import { useSession } from "next-auth/react";
import { IUser } from "@/app/interface";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import PageWrapper from "@/app/components/block/PageWrapper";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useSearch } from "@/app/hooks/useSearch";
import { usePagination } from "@/app/hooks/usePagination";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/app/components/SearchInput";
import { CustomPagination } from "@/app/components/CustomPagination";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { InviteUserModal } from "@/app/components/InviteUserModal";

const inviteFormSchema = z.object({
  email: z.string().email("Email invalide"),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  role: z.enum(["EMPLOYEE", "ADMIN"]),
  language: z.enum(["FR", "EN"]),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface InviteUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: InviteFormValues) => Promise<void>;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { data: session }: any = useSession();
  const { mutate: deleteUserMutation } = useDeleteUser();
  const { data, isLoading } = useGetUsers();

  const { mutate: inviteUser } = useInviteUser();

  const [dataSelected, setDataSelected] = useState<IUser | null>(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "EMPLOYEE",
      language: "FR",
    },
  });

  const [openInviteModal, setOpenInviteModal] = useState(false);

  const handleInvite = async (values: InviteFormValues) => {
    try {
      // Appel API à implémenter
      console.log("Inviting user:", values);

      await inviteUser(values, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["users"] });
          message.success("Invitation envoyée avec succès");
          setOpenInviteModal(false);
        },
        onError: () => {
          message.error("Erreur lors de l'envoi de l'invitation");
        },
      });

      setOpenInviteModal(false);
    } catch (error) {
      message.error("Erreur lors de l'envoi de l'invitation");
    }
  };

  // Utilisation du hook de recherche
  const { searchQuery, setSearchQuery, filteredData } = useSearch({
    data: data || [],
    searchKeys: ["identifier", "firstName", "lastName", "phone", "role"],
  });

  // Utilisation du hook de pagination
  const { currentItems, currentPage, totalPages, setCurrentPage } =
    usePagination({
      data: filteredData,
      itemsPerPage: 10,
    });

  const deleteUser = async (id: string) => {
    try {
      await deleteUserMutation(id);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      message.success("User deleted successfully");
    } catch (error: any) {
      message.error("Error deleting user");
    }
  };

  if (!session) {
    return (
      <p className="text-center mt-10">
        You need to login to access this page!
      </p>
    );
  }

  return (
    <PageWrapper
      title="Utilisateurs"
      icon={<Plus />}
      buttonTitle="Add Membre"
      handleClick={() => setOpenInviteModal(true)}
    >
      {(session && session.user.role === ADMIN) ||
      session.user.role === OWNER ? (
        <div className="space-y-4">
          <div className="">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Rechercher un utilisateur..."
            />
          </div>

          <InviteUserModal
            open={openInviteModal}
            onOpenChange={setOpenInviteModal}
            onSubmit={handleInvite}
          />

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">#</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Création</TableHead>
                  <TableHead className="text-right">
                    <Settings className="h-4 w-4" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems?.map((user: IUser) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Badge variant="outline">{user.identifier}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={user.status ? "success" : "destructive"}
                        >
                          {user.status ? "Active" : "Inactive"}
                        </Badge>
                        {user.firstName} {user.lastName}
                      </div>
                    </TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                      <Badge>{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {dayjs(user.createdAt).format("DD MMM YYYY")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDataSelected(user);
                            setIsUpdate(true);
                            setOpenModal(true);
                          }}
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Êtes-vous sûr de vouloir supprimer cet
                                utilisateur ?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => user.id && deleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

          <Dialog
            open={openModal}
            onOpenChange={(open) => {
              if (!open) {
                setOpenModal(false);
                setDataSelected(null);
              } else {
                setOpenModal(true);
              }
            }}
          >
            <DialogContent
              className="max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <DialogHeader>
                <DialogTitle>
                  {isUpdate ? "" : "Ajouter un utilisateur"}
                </DialogTitle>
              </DialogHeader>
              <FormAddUser
                dataSelected={dataSelected}
                setIsUpdate={setIsUpdate}
                isUpdate={isUpdate}
                mode="admin"
                setOpen={setOpenModal}
              />
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <p className="text-center mt-5">Vous n&apos;avez pas les droits</p>
      )}
    </PageWrapper>
  );
}
