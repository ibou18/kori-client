"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";

interface WebBookingParticularitiesDialogProps {
  open: boolean;
  particularities: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Confirmation de lecture des particularités avant de quitter l'étape service (aligné app mobile). */
export function WebBookingParticularitiesDialog({
  open,
  particularities,
  onCancel,
  onConfirm,
}: WebBookingParticularitiesDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (open) setAcknowledged(false);
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Particularités du service</AlertDialogTitle>
          <AlertDialogDescription>
            Lisez attentivement ces informations du salon avant de continuer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="max-h-[40vh] overflow-y-auto whitespace-pre-line rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-slate-800">
          {particularities}
        </div>

        <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-slate-900"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
          />
          J&apos;ai lu et compris les particularités de ce service.
        </label>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Retour</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={!acknowledged}>
            Continuer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
