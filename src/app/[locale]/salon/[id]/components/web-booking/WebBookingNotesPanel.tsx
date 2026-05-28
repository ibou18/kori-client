"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

const MAX_NOTES_LENGTH = 500;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface WebBookingNotesPanelProps {
  clientNotes: string;
  onClientNotesChange: (value: string) => void;
  referencePhotoFile: File | null;
  referencePhotoPreview: string | null;
  onPhotoSelect: (file: File, previewUrl: string) => void;
  onPhotoRemove: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export function WebBookingNotesPanel({
  clientNotes,
  onClientNotesChange,
  referencePhotoFile,
  referencePhotoPreview,
  onPhotoSelect,
  onPhotoRemove,
  onContinue,
  onBack,
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

    const previewUrl = URL.createObjectURL(file);
    onPhotoSelect(file, previewUrl);
  };

  const hasContent =
    clientNotes.trim().length > 0 || referencePhotoFile !== null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Optionnel — aidez la coiffeuse à préparer votre rendez-vous avec des
        précisions ou une photo de référence.
      </p>

      <div>
        <Label htmlFor="wb-client-notes">Précisions pour la coiffeuse</Label>
        <textarea
          id="wb-client-notes"
          value={clientNotes}
          onChange={(e) => onClientNotesChange(e.target.value)}
          placeholder="Ex. : cheveux fins, préfère les coupes courtes, allergique à certains produits…"
          maxLength={MAX_NOTES_LENGTH}
          rows={5}
          className="mt-1 flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#53745D]/30 focus:border-[#53745D] resize-y min-h-[120px]"
        />
        <p className="mt-1 text-right text-[11px] text-slate-500">
          {clientNotes.length}/{MAX_NOTES_LENGTH} caractères
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-800">
          Photo de référence (optionnel)
        </p>
        <p className="text-xs text-slate-500 mt-0.5 mb-2">
          Ajoutez une photo de la coiffure souhaitée pour illustrer vos attentes.
        </p>

        {photoError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-2">
            {photoError}
          </p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          className="sr-only"
          onChange={handleFileChange}
        />

        {referencePhotoPreview ? (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <Image
              src={referencePhotoPreview}
              alt="Photo de référence"
              width={800}
              height={400}
              unoptimized
              className="w-full h-[200px] object-cover"
            />
            <button
              type="button"
              onClick={onPhotoRemove}
              className="absolute top-2 right-2 rounded-full bg-white/95 p-1.5 shadow border border-slate-200 text-slate-700 hover:bg-white"
              aria-label="Supprimer la photo"
            >
              <X className="h-4 w-4" />
            </button>
            {referencePhotoFile && (
              <p className="text-[11px] text-slate-500 px-3 py-2 border-t border-slate-100 truncate">
                {referencePhotoFile.name}
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-[#53745D] hover:border-[#53745D]/40 hover:bg-[#F0F4F1]/50 transition-colors"
          >
            <ImagePlus className="h-8 w-8" />
            <span className="text-sm font-medium">Ajouter une photo</span>
          </button>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          Retour
        </Button>
        <Button type="button" className="flex-1" onClick={onContinue}>
          {hasContent ? "Continuer" : "Passer cette étape"}
        </Button>
      </div>
    </div>
  );
}
