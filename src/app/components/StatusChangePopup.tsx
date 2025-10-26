import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUpdateInvoice } from "../data/hooks";
import { message, Spin } from "antd";
import { IInvoice } from "../interface";

interface StatusChangePopupProps {
  currentStatus: string;
  invoice: IInvoice;
  onStatusChange: () => void;
}

export function StatusChangePopup({
  currentStatus,
  invoice,
  onStatusChange,
}: StatusChangePopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState<string>("");
  const { mutate: updateInvoice, isPending } = useUpdateInvoice();

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateInvoice(
        {
          invoiceId: invoice.id,
          ...invoice,
          status: newStatus,
        },
        {
          onSuccess: () => {
            onStatusChange();
            setIsOpen(false);
          },
        }
      );
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  useEffect(() => {
    if (currentStatus === "PAID") {
      setColor("bg-teal-500 text-white");
    } else if (currentStatus === "FAILED") {
      setColor("bg-red-500 text-white");
    } else if (currentStatus === "PENDING") {
      setColor("bg-orange-500 text-white");
    } else if (currentStatus === "PARTIAL") {
      setColor("bg-yellow-500 text-white");
    }
  }, [currentStatus]);

  const renderStatusButtons = () => {
    switch (currentStatus) {
      case "PAID":
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleStatusChange("PENDING")}
                className="bg-yellow-500 hover:bg-yellow-600 w-full"
              >
                En Attente 🤔
              </Button>
              <Button
                onClick={() => handleStatusChange("PARTIAL")}
                className="bg-orange-500 hover:bg-orange-600 w-full"
              >
                Partiellement Payé 💰
              </Button>
            </div>
            <Button
              onClick={() => handleStatusChange("FAILED")}
              className="bg-red-500 hover:bg-red-600 text-white font-bold w-full"
            >
              Impayé 💥
            </Button>
          </div>
        );

      case "PARTIAL":
        return (
          <div className="space-y-3">
            <Button
              onClick={() => handleStatusChange("PAID")}
              className="bg-green-500 hover:bg-green-600 text-white font-bold w-full"
            >
              Payé Totalement 🎉
            </Button>
            <Button
              onClick={() => handleStatusChange("PENDING")}
              className="bg-yellow-500 hover:bg-yellow-600 w-full"
            >
              En Attente 🤔
            </Button>
            <Button
              onClick={() => handleStatusChange("FAILED")}
              className="bg-red-500 hover:bg-red-600 text-white font-bold w-full"
            >
              Impayé 💥
            </Button>
          </div>
        );

      case "PENDING":
        return (
          <div className="space-y-3">
            <Button
              onClick={() => handleStatusChange("PAID")}
              className="bg-green-500 hover:bg-green-600 text-white font-bold w-full"
            >
              Payé Totalement 🎉
            </Button>
            <Button
              onClick={() => handleStatusChange("PARTIAL")}
              className="bg-orange-500 hover:bg-orange-600 w-full"
            >
              Partiellement Payé 💰
            </Button>
            <Button
              onClick={() => handleStatusChange("FAILED")}
              className="bg-red-500 hover:bg-red-600 text-white font-bold w-full"
            >
              Impayé 💥
            </Button>
          </div>
        );

      case "FAILED":
        return (
          <div className="space-y-3">
            <Button
              onClick={() => handleStatusChange("PAID")}
              className="bg-green-500 hover:bg-green-600 text-white font-bold w-full"
            >
              Payé Totalement 🎉
            </Button>
            <Button
              onClick={() => handleStatusChange("PARTIAL")}
              className="bg-orange-500 hover:bg-orange-600 w-full"
            >
              Partiellement Payé 💰
            </Button>
            <Button
              onClick={() => handleStatusChange("PENDING")}
              className="bg-yellow-500 hover:bg-yellow-600 w-full"
            >
              En Attente 🤔
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <Badge className={`${color} cursor-pointer hover:opacity-80`}>
          {currentStatus}
        </Badge>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Changer le statut de la Facture </DialogTitle>
          <DialogDescription>
            Choisir un nouveau statut pour la facture
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isPending ? (
            <div className="flex justify-center items-center h-20">
              <Spin />
            </div>
          ) : (
            <div className="py-4">{renderStatusButtons()}</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
