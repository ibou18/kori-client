import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, PlusCircle } from "lucide-react";

export default function FornAddReceiver({
  setOpenReceiverDialog,
  newReceiverData,
  handleAddReceiver,
  isAddingReceiver,
  handleReceiverChange,
  openReceiverDialog,
  setIsAddingReceiver,
}: {
  setOpenReceiverDialog: (open: boolean) => void;
  openReceiverDialog: boolean;
  setIsAddingReceiver: (isAdding: boolean) => void;
  newReceiverData: any;
  handleAddReceiver: any;
  isAddingReceiver: boolean;
  handleReceiverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <Dialog open={openReceiverDialog} onOpenChange={setOpenReceiverDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4" />
          <span>Nouveau destinataire</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un destinataire</DialogTitle>
          <DialogDescription>
            Ajoutez rapidement un nouveau destinataire pour votre livraison.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                name="firstName"
                required
                value={newReceiverData.firstName}
                onChange={handleReceiverChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                name="lastName"
                required
                value={newReceiverData.lastName}
                onChange={handleReceiverChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={newReceiverData.email}
              onChange={handleReceiverChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={newReceiverData.phone}
              onChange={handleReceiverChange}
            />
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenReceiverDialog(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleAddReceiver} disabled={isAddingReceiver}>
              {isAddingReceiver ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                "Ajouter le destinataire"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
