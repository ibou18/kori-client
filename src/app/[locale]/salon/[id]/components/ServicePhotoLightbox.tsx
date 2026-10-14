"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useState, type KeyboardEvent, type MouseEvent } from "react";

interface ServicePhotoLightboxProps {
  open: boolean;
  onClose: () => void;
  photos: Array<{ url: string; alt?: string }>;
  title: string;
  isEn: boolean;
}

/**
 * Agrandit les photos d'une prestation en plein écran.
 * Fermeture : bouton, touche Échap ou clic en dehors de l'image.
 */
export function ServicePhotoLightbox({
  open,
  onClose,
  photos,
  title,
  isEn,
}: ServicePhotoLightboxProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[100] bg-black/90 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        {/* Le contenu est démonté à la fermeture : l'index repart de 0 à
            chaque ouverture. */}
        <LightboxContent
          photos={photos}
          title={title}
          isEn={isEn}
          onClose={onClose}
        />
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function LightboxContent({
  photos,
  title,
  isEn,
  onClose,
}: Omit<ServicePhotoLightboxProps, "open">) {
  const [index, setIndex] = useState(0);
  const count = photos.length;
  const photo = photos[index];
  const hasMany = count > 1;

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!hasMany) return;
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === "ArrowRight") go(1);
  };

  // Le contenu couvre tout l'écran : un clic sur la zone vide autour de
  // l'image doit fermer, comme un clic sur l'overlay.
  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <DialogPrimitive.Content
      aria-describedby={undefined}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
    >
      <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>

      {photo ? (
        // Taille auto (pas `fill`) : la boîte suit le ratio réel de la photo,
        // les bandes vides autour restent cliquables pour fermer.
        <Image
          key={photo.url}
          src={photo.url}
          alt={photo.alt || title}
          width={1600}
          height={1600}
          sizes="100vw"
          priority
          className="h-auto max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
        />
      ) : null}

      {hasMany ? (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={isEn ? "Previous photo" : "Photo précédente"}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-4"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label={isEn ? "Next photo" : "Photo suivante"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-4"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm font-medium tabular-nums text-white/80">
            {index + 1} / {count}
          </p>
        </>
      ) : null}

      <DialogPrimitive.Close
        aria-label={isEn ? "Close" : "Fermer"}
        className="absolute right-3 top-3 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-4 sm:top-4"
      >
        <X className="h-5 w-5" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  );
}
