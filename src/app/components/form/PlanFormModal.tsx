import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormPlan } from "@/app/components/form/FormPlan";
import { IPlan } from "@/app/interface";

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: IPlan;
}

export function PlanFormModal({ isOpen, onClose, plan }: PlanFormModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {plan ? "Modifier le plan" : "Créer un nouveau plan"}
          </DialogTitle>
        </DialogHeader>
        <FormPlan initialData={plan} onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
}
