"use client";
import { useState } from "react";
import FormAddClient from "@/app/components/form/FormAddClient";
import {
  useCreateClient,
  useDeleteClient,
  useGetClients,
  useUpdateClient,
} from "@/app/data/hooks";
import { Form, message, Modal } from "antd";
import { EditIcon, Plug2, Plus, Trash2Icon, Unplug } from "lucide-react";
import { ADMIN, GET_CLIENTS, GET_USERS } from "@/shared/constantes";
import { useSession } from "next-auth/react";
import { IClient } from "@/app/interface";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import dayjs from "dayjs";
import PageWrapper from "@/app/components/block/PageWrapper";

// Shadcn UI imports
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function ClientsPage() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { data: session }: any = useSession();
  const { mutate: deleteClientMutation } = useDeleteClient();
  const { data: clients, isLoading } = useGetClients();
  const [selectedId, setSelectedId] = useState<any>(null);

  const [dataSelected, setDataSelected] = useState<any>(null);
  const [isUpdate, setIsUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });

  const { mutate: createClientMutate } = useCreateClient();
  const { mutate: updateClientMutation } = useUpdateClient();

  const deleteClient = async (id: string) => {
    try {
      await deleteClientMutation(id);
      queryClient.invalidateQueries({ queryKey: [GET_USERS] });
      message.success("Client supprimé avec succès");
    } catch (error: any) {
      console.error("Erreur lors de la suppression", error);
      message.error("Erreur lors de la suppression du client");
    }
  };

  // Filtrer les clients en fonction de la recherche
  const filteredClients = clients?.filter((client: IClient) =>
    Object.values(client).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const statusBadge = (status: boolean) => {
    if (status) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <Plug2 className="w-4 h-4 mr-1" />
          Actif
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <Unplug className="w-4 h-4 mr-1" />
        Inactif
      </Badge>
    );
  };

  if (!session) {
    return (
      <p className="text-center mt-10">
        Connexion requise pour accéder à cette page!
      </p>
    );
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  const handleAddClient = async () => {
    try {
      await createClientMutate({
        ...newClient,
      });
      queryClient.invalidateQueries({ queryKey: [GET_CLIENTS] });
      message.success("Client ajouté avec succès");
      setOpenModal(false);
      setNewClient({
        name: "",
        email: "",
        address: "",
        phone: "",
      });
    } catch (error) {
      message.error("Erreur lors de l'ajout du client");
      console.error("Error adding client:", error);
    }
  };

  const handleUpdateClient = async () => {
    try {
      await updateClientMutation({
        id: selectedId,
        data: dataSelected,
      });
      queryClient.invalidateQueries({ queryKey: [GET_CLIENTS] });
      message.success("Client mis à jour avec succès");
      setOpenModal(false);
      setDataSelected(null);
    } catch (error) {
      message.error("Erreur lors de la mise à jour du client");
      console.error("Error updating client:", error);
    }
  };

  return (
    <PageWrapper
      title="Clients"
      icon={<Plus />}
      buttonTitle="Nouveau Client"
      handleClick={() => setOpenModal(true)}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Input
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border border-gray-200 p-4">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold">Liste des clients</h2>
            <span className="text-sm text-gray-500 ml-10">
              {filteredClients?.length} clients
            </span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">#</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients?.map((client: IClient) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <Badge variant="outline">{client.identifier}</Badge>
                  </TableCell>
                  <TableCell> {client.name}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell>
                    {dayjs(client.createdAt).format("DD MMM YYYY")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          form.setFieldsValue(client);
                          setSelectedId(client.id);
                          setDataSelected({
                            name: client.name,
                            email: client.email,
                            address: client.address,
                            phone: client.phone,
                          });
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
                            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action ne peut pas être annulée. Le client
                              sera définitivement supprimé.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteClient(client.id)}
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

        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isUpdate ? "Modifier le client" : "Ajouter un client"}
              </DialogTitle>
              <DialogDescription>
                {isUpdate
                  ? "Modifiez les informations du client ci-dessous."
                  : "Remplissez les informations du nouveau client."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={dataSelected?.name || newClient.name}
                  onChange={(e) =>
                    isUpdate
                      ? setDataSelected({
                          ...dataSelected!,
                          name: e.target.value,
                        })
                      : setNewClient({ ...newClient, name: e.target.value })
                  }
                  placeholder="Nom du client"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  value={dataSelected?.email || newClient.email}
                  onChange={(e) =>
                    isUpdate
                      ? setDataSelected({
                          ...dataSelected!,
                          email: e.target.value,
                        })
                      : setNewClient({ ...newClient, email: e.target.value })
                  }
                  placeholder="Email du client"
                />
              </div>

              <div>
                <Label>Adresse</Label>
                <Input
                  value={dataSelected?.address || newClient.address}
                  onChange={(e) =>
                    isUpdate
                      ? setDataSelected({
                          ...dataSelected!,
                          address: e.target.value,
                        })
                      : setNewClient({ ...newClient, address: e.target.value })
                  }
                  placeholder="Adresse du client"
                />
              </div>

              <div>
                <Label>Téléphone</Label>
                <Input
                  maxLength={10}
                  value={dataSelected?.phone || newClient.phone}
                  onChange={(e) =>
                    isUpdate
                      ? setDataSelected({
                          ...dataSelected!,
                          phone: e.target.value,
                        })
                      : setNewClient({
                          ...newClient,
                          phone: e.target.value,
                        })
                  }
                  placeholder="Numéro de téléphone"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => {
                  setOpenModal(false);
                  setDataSelected(null);
                  setSelectedId(null);
                  setNewClient({
                    name: "",
                    email: "",
                    address: "",
                    phone: "",
                  });
                }}
              >
                Annuler
              </Button>
              <Button onClick={isUpdate ? handleUpdateClient : handleAddClient}>
                {isUpdate ? "Modifier" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
}
