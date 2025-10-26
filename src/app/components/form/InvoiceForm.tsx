"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { useParams } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CalendarIcon, Loader2 } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import {
  useCreateInvoice,
  useGetUsers,
  useGetDeliveries,
  useUpdateInvoice,
} from "@/app/data/hooksHop";
import { message } from "antd";
import { InvoiceStatus } from "@/app/interfaceHop";

interface InvoiceFormProps {
  mode?: "create" | "edit";
  invoice?: any;
  isLoading?: boolean;
}

export function InvoiceForm({
  mode = "create",
  invoice,
  isLoading,
}: InvoiceFormProps) {
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: `INV-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`,
    amount: 0,
    platformFee: 0,
    taxAmount: 0,
    totalAmount: 0,
    status: "PENDING" as InvoiceStatus,
    userId: "",
    deliveryId: "",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Par défaut +30 jours
    paymentDate: null as Date | null,
  });

  // Récupération des utilisateurs et des livraisons
  const { data: users = [], isLoading: loadingUsers } = useGetUsers();
  const { data: deliveries = [], isLoading: loadingDeliveries } =
    useGetDeliveries();

  const { mutate: createInvoice } = useCreateInvoice();
  const { mutate: updateInvoice } = useUpdateInvoice();

  // Fonction pour obtenir la locale
  const getLocale = () => {
    return locale === "fr" ? fr : enUS;
  };

  // Pré-remplir le formulaire si on est en mode édition
  useEffect(() => {
    if (mode === "edit" && invoice && !isLoading) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        platformFee: invoice.platformFee,
        taxAmount: invoice.taxAmount,
        totalAmount: invoice.totalAmount,
        status: invoice.status,
        userId: invoice.userId,
        deliveryId: invoice.deliveryId || "",
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
        paymentDate: invoice.paymentDate ? new Date(invoice.paymentDate) : null,
      });
    }
  }, [mode, invoice, isLoading]);

  // Calcul automatique du montant total
  useEffect(() => {
    const total =
      Number(formData.amount) +
      Number(formData.platformFee) +
      Number(formData.taxAmount);
    setFormData((prev) => ({
      ...prev,
      totalAmount: parseFloat(total.toFixed(2)),
    }));
  }, [formData.amount, formData.platformFee, formData.taxAmount]);

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation de base
    if (!formData.userId) {
      message.error("Veuillez sélectionner un utilisateur");
      return;
    }

    if (!formData.invoiceNumber) {
      message.error("Veuillez indiquer un numéro de facture");
      return;
    }

    setSubmitting(true);

    try {
      // Convert Date objects to ISO strings
      const formattedData = {
        ...formData,
        dueDate: formData.dueDate ? formData.dueDate.toISOString() : "",
        paymentDate: formData.paymentDate
          ? formData.paymentDate.toISOString()
          : null,
      };

      if (mode === "create") {
        createInvoice(formattedData, {
          onSuccess: () => {
            message.success("Facture créée avec succès !");
            router.push("/admin/invoices");
          },
          onError: (error: any) => {
            message.error(
              error.formattedMessage ||
                "Erreur lors de la création de la facture"
            );
          },
        });
      } else {
        await updateInvoice(
          {
            id: invoice.id,
            data: formattedData,
          },
          {
            onSuccess: () => {
              message.success("Facture mise à jour avec succès !");
              router.push("/admin/invoices");
            },
            onError: (error: any) => {
              message.error(
                error.formattedMessage ||
                  "Erreur lors de la mise à jour de la facture"
              );
            },
          }
        );
      }
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour gérer les changements dans les champs
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {mode === "create" ? "Créer une facture" : "Modifier la facture"}
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Numéro de facture */}
          <div className="mb-6">
            <Label htmlFor="invoiceNumber">Numéro de facture</Label>
            <div className="flex">
              <span className="px-3 border border-r-0 rounded-l-md bg-muted flex items-center">
                #
              </span>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                className="rounded-l-none"
              />
            </div>
          </div>

          {/* Sélection de l'utilisateur */}
          <div className="mb-6">
            <Label htmlFor="userId">Client</Label>
            {loadingUsers ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Chargement des clients...</span>
              </div>
            ) : (
              <Select
                value={formData.userId}
                onValueChange={(value) => handleChange("userId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un client" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Sélection de la livraison */}
          <div className="mb-6">
            <Label htmlFor="deliveryId">Livraison associée</Label>
            {loadingDeliveries ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Chargement des livraisons...</span>
              </div>
            ) : (
              <Select
                value={formData.deliveryId || "none"}
                onValueChange={(value) =>
                  handleChange("deliveryId", value === "none" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez une livraison (optionnel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune livraison</SelectItem>
                  {deliveries.deliveries.map((delivery: any) => (
                    <SelectItem key={delivery.id} value={delivery.id}>
                      #{delivery.trackingNumber} - {delivery.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Montants */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="amount">Montant de base</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  handleChange("amount", parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <Label htmlFor="platformFee">Frais de plateforme</Label>
              <Input
                id="platformFee"
                type="number"
                step="0.01"
                value={formData.platformFee}
                onChange={(e) =>
                  handleChange("platformFee", parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div>
              <Label htmlFor="taxAmount">Montant des taxes</Label>
              <Input
                id="taxAmount"
                type="number"
                step="0.01"
                value={formData.taxAmount}
                onChange={(e) =>
                  handleChange("taxAmount", parseFloat(e.target.value) || 0)
                }
              />
            </div>
          </div>

          {/* Montant total (calculé) */}
          <div className="mb-6">
            <Label htmlFor="totalAmount">Montant total</Label>
            <div className="flex items-center p-2 border rounded-md bg-muted/50">
              <span className="font-semibold">
                {formatCurrency({
                  amount: formData.totalAmount,
                  currency: "CAD",
                })}
              </span>
              <span className="ml-1 text-sm text-muted-foreground">
                (calculé automatiquement)
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value: InvoiceStatus) =>
                handleChange("status", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="PAID">Payée</SelectItem>
                <SelectItem value="OVERDUE">En retard</SelectItem>
                <SelectItem value="CANCELED">Annulée</SelectItem>
                <SelectItem value="REFUNDED">Remboursée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date d'échéance */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label>Date d&apos;échéance</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      format(formData.dueDate, "PPP", { locale: getLocale() })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate || undefined}
                    onSelect={(date) => handleChange("dueDate", date)}
                    locale={getLocale()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date de paiement (affichée uniquement si le statut est PAID) */}
            {(formData.status === "PAID" || formData.status === "REFUNDED") && (
              <div>
                <Label>Date de paiement</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.paymentDate ? (
                        format(formData.paymentDate, "PPP", {
                          locale: getLocale(),
                        })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.paymentDate || undefined}
                      onSelect={(date) => handleChange("paymentDate", date)}
                      locale={getLocale()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/invoices")}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Création..." : "Modification..."}
                </>
              ) : mode === "create" ? (
                "Créer la facture"
              ) : (
                "Mettre à jour la facture"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
