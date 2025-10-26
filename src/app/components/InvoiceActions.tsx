/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  ClockAlertIcon,
  MailCheck,
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteInvoice,
  useSendInvoice,
  useUpdateInvoice,
} from "../data/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { GET_INVOICES } from "@/shared/constantes";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IInvoice } from "../interface";

interface iAppProps {
  invoice: IInvoice;
  status: string;
  filters?: any;
}
export function InvoiceActions({ invoice, status, filters }: iAppProps) {
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);

  const [openEmailModal, setOpenEmailModal] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");

  const { mutate: updateInvoice } = useUpdateInvoice();
  const { mutate: deleteInvoice } = useDeleteInvoice();
  const { mutate: sendInvoice } = useSendInvoice();

  const handleSendInvoice = async () => {
    const payload: any = {
      id: invoice.id,
      message: emailMessage,
    };

    await sendInvoice(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [GET_INVOICES] });
        setOpenEmailModal(false);
        setEmailMessage("");
        toast.success("Invoice sent successfully");
      },
      onError: () => {
        toast.error("Failed to send invoice");
      },
    });
  };

  const handleMarkAsPaid = async () => {
    const payload: any = {
      ...invoice,
      id: invoice.id,
      status: invoice.status === "PAID" ? "PENDING" : "PAID",
    };
    try {
      await updateInvoice(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [GET_INVOICES] });
        },
      });
      toast.success("Invoice marked as paid");
      setOpenModal(false);
    } catch (error: any) {
      console.log("error", error);
      toast.error("Failed to mark invoice as paid");
    }
  };

  const hanleDeleteInvoice = async () => {
    try {
      await deleteInvoice(invoice.id);
      queryClient.invalidateQueries({ queryKey: [GET_INVOICES, filters] });

      toast.success("Invoice deleted successfully");
    } catch (error: any) {
      console.log("error", error);
      toast.error("Failed to delete invoice");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="secondary">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/invoices/${invoice.id}`}>
              <Pencil className="size-4 mr-2" /> Modifier Facture
            </Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem onClick={handleSendReminder}>
          <MailCheck className="size-4 mr-2" /> Send Facture Mail
        </DropdownMenuItem> */}
          <DropdownMenuItem onClick={() => setOpenEmailModal(true)}>
            <MailCheck className="size-4 mr-2" /> Envoyer Facture
          </DropdownMenuItem>
          {/* <DropdownMenuItem>
          <Mail className="size-4 mr-2" /> Reminder Email
        </DropdownMenuItem> */}
          <DropdownMenuItem asChild className="mt-2">
            <Button
              className="bg-red-500  text-white"
              onClick={hanleDeleteInvoice}
            >
              <Trash className="size-4 mr-2" /> Supprimer Facture
            </Button>
          </DropdownMenuItem>
          {status !== "PAID" ? (
            <DropdownMenuItem asChild className="mt-2 w-full">
              <Button onClick={() => setOpenModal(true)}>
                <CheckCircle className="size-4 mr-2" /> Mark as Paid
              </Button>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild className="mt-2 w-full">
              <Button onClick={() => setOpenModal(true)}>
                <ClockAlertIcon className="size-4 mr-2" />
                En attente
              </Button>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Invoice as Paid</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this invoice as paid? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleMarkAsPaid}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openEmailModal} onOpenChange={setOpenEmailModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Envoyer la facture par email</DialogTitle>
            <DialogDescription>
              Personnalisez votre message avant l&apos;envoi de la facture.
            </DialogDescription>
            <p className="italic"> Destinataire : {invoice.fromEmail}</p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message - Optionnel</Label>
              <Textarea
                id="message"
                placeholder="Ajoutez un message personnalisé..."
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={5}
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setOpenEmailModal(false);
                setEmailMessage("");
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleSendInvoice}>Envoyer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
