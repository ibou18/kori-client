/* eslint-disable react/no-unescaped-entities */
import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";

interface ConfirmationStepProps {
  onReturn: () => void;
}

const ConfirmationStep = ({ onReturn }: ConfirmationStepProps) => {
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto bg-green-100 rounded-full p-4 w-16 h-16 flex items-center justify-center">
        <UserCheck className="h-8 w-8 text-green-600" />
      </div>

      <h3 className="text-xl font-semibold">
        Vérification soumise avec succès
      </h3>

      <p className="text-muted-foreground">
        Votre demande de vérification d'identité a été reçue. Notre équipe va
        l'examiner et vous serez notifié une fois le processus terminé. Ce
        processus peut prendre jusqu'à 48 heures.
      </p>

      <Button className="mt-4" onClick={onReturn}>
        Retour au tableau de bord
      </Button>
    </div>
  );
};

export default ConfirmationStep;
