"use client";

import { Camera, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import {
  WebBookingCta,
  WebBookingSecondaryAction,
  WebBookingStepActions,
  type WebBookingFooterSummary,
} from "./WebBookingStepActions";

const MAX_NOTES_LENGTH = 500;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface WebBookingNotesPanelProps {
  salonName: string;
  clientNotes: string;
  onClientNotesChange: (value: string) => void;
  referencePhotoFile: File | null;
  referencePhotoPreview: string | null;
  onPhotoSelect: (file: File, previewUrl: string) => void;
  onPhotoRemove: () => void;
  onContinue: () => void;
  summary: WebBookingFooterSummary | null;
}

/**
 * Étape facultative (maquette) : note pour la prestataire et photo de
 * référence. « Passer cette étape » est proposé sous le bouton principal et
 * dans l'en-tête.
 */
export function WebBookingNotesPanel({
  salonName,
  clientNotes,
  onClientNotesChange,
  referencePhotoFile,
  referencePhotoPreview,
  onPhotoSelect,
  onPhotoRemove,
  onContinue,
  summary,
}: WebBookingNotesPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setPhotoError("Format accepté : JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhotoError("La photo ne doit pas dépasser 5 Mo.");
      return;
    }
    onPhotoSelect(file, URL.createObjectURL(file));
  };

  const hasContent = clientNotes.trim().length > 0 || referencePhotoFile !== null;

  return (
    <>
      <div className="flex flex-1 flex-col gap-5 px-5 pb-5 pt-2">
        <p className="text-sm text-site-fg-2">
          Aidez {salonName} à préparer votre rendez-vous. Cette étape est facultative.
        </p>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="wb-client-notes" className="text-[15px] font-semibold">
            Note pour la prestataire
          </label>
          <textarea
            id="wb-client-notes"
            value={clientNotes}
            onChange={(e) => onClientNotesChange(e.target.value)}
            placeholder="Ex. : j'aimerais les tresses jusqu'au bas du dos, avec quelques perles dorées. Cuir chevelu sensible."
            maxLength={MAX_NOTES_LENGTH}
            rows={5}
            aria-describedby="wb-notes-count"
            className="w-full resize-none rounded-xl border border-site-border-strong bg-site-bg px-3.5 py-3 text-[15px] text-site-fg placeholder:text-site-muted focus:border-site-accent focus:outline-none focus:ring-2 focus:ring-site-accent/20"
          />
          <p id="wb-notes-count" className="self-end text-xs tabular-nums text-site-muted">
            {clientNotes.length}/{MAX_NOTES_LENGTH} caractères
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <div>
            <p className="text-[15px] font-semibold">Photo de référence</p>
            <p className="text-[13px] text-site-muted">Montrez le style que vous voulez.</p>
          </div>
          {photoError && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">{photoError}</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="sr-only"
            onChange={handleFileChange}
          />
          <div className="grid grid-cols-3 gap-2.5">
            {referencePhotoPreview ? (
              <div className="relative aspect-square overflow-hidden rounded-[14px] bg-site-media">
                <Image src={referencePhotoPreview} alt="Photo de référence" fill unoptimized className="object-cover" />
                <button
                  type="button"
                  onClick={onPhotoRemove}
                  aria-label="Retirer la photo"
                  className="absolute right-1 top-1 grid size-8 place-items-center rounded-full bg-[rgba(17,17,17,0.72)] text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-site-border-strong bg-site-surface-2 text-[13px] font-semibold text-site-fg transition-colors hover:bg-site-surface"
              >
                <Camera className="size-6" strokeWidth={1.8} />
                Ajouter
              </button>
            )}
          </div>
          <p className="text-xs text-site-muted">Seule {salonName} verra votre photo.</p>
        </div>
      </div>

      <WebBookingStepActions
        summary={summary}
        secondary={
          hasContent ? null : (
            <WebBookingSecondaryAction onClick={onContinue}>Passer cette étape</WebBookingSecondaryAction>
          )
        }
      >
        <WebBookingCta type="button" onClick={onContinue}>
          {hasContent ? "Continuer vers le paiement" : "Continuer sans note"}
        </WebBookingCta>
      </WebBookingStepActions>
    </>
  );
}
