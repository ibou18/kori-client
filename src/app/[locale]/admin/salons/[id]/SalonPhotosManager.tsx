"use client";

import {
  deleteSalonPhotoProApi,
  getSalonPhotosApi,
  setMainSalonPhotoApi,
  uploadSalonPhotoProApi,
} from "@/app/data/services";
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
import { cn } from "@/lib/utils";
import { GET_SALON } from "@/shared/constantes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { adminErrorMessage } from "../../ma-boutique/useShopAdmin";

export interface ManagedSalonPhoto {
  id: string;
  url: string;
  alt?: string | null;
  order: number;
  isMain?: boolean;
}

export const SALON_PHOTO_MAX = 10;
const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

/** Rejette les fichiers hors format ou trop lourds (le serveur ne les contrôle pas). */
export function checkSalonPhotoFile(file: { type: string; size: number }): string | null {
  if (!ACCEPTED.includes(file.type)) return "Format non supporté : PNG, JPG ou WebP.";
  if (file.size > MAX_BYTES) return "Photo trop lourde (10 Mo maximum).";
  return null;
}

/**
 * « Mon salon » : photos affichées sur la page salon (carrousel, galerie) et dans
 * l'app. Ajout (plusieurs à la fois), choix de la photo principale, suppression.
 */
export function SalonPhotosManager({ salonId, salonName }: { salonId: string; salonName: string }) {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState<ManagedSalonPhoto | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const key = ["salon-photos-manage", salonId];

  const { data: photos = [], isLoading } = useQuery({
    queryKey: key,
    queryFn: async () => {
      const res = (await getSalonPhotosApi(salonId)) as { data?: ManagedSalonPhoto[] } | null;
      return Array.isArray(res?.data) ? res.data : [];
    },
    enabled: !!salonId,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: key });
    queryClient.invalidateQueries({ queryKey: [GET_SALON, salonId] });
  };

  const upload = async (files: File[]) => {
    const room = SALON_PHOTO_MAX - photos.length;
    if (room <= 0) {
      toast.error(`${SALON_PHOTO_MAX} photos maximum.`);
      return;
    }
    const valid: File[] = [];
    for (const file of files) {
      const problem = checkSalonPhotoFile(file);
      if (problem) toast.error(`${file.name} : ${problem}`);
      else valid.push(file);
    }
    if (valid.length > room) toast.error(`${SALON_PHOTO_MAX} photos maximum : seules les ${room} premières sont ajoutées.`);
    const batch = valid.slice(0, room);
    if (!batch.length) return;

    // Pas de photo principale encore : la première envoyée le devient.
    let needsMain = !photos.some((p) => p.isMain);
    let added = 0;
    setUploadingCount(batch.length);
    for (const file of batch) {
      try {
        await uploadSalonPhotoProApi(salonId, file, needsMain);
        needsMain = false;
        added++;
      } catch (error) {
        toast.error(`${file.name} : ${adminErrorMessage(error, "envoi impossible.")}`);
      }
      setUploadingCount((n) => n - 1);
    }
    setUploadingCount(0);
    refresh();
    if (added) toast.success(added > 1 ? `${added} photos ajoutées` : "Photo ajoutée");
  };

  const setMain = useMutation({
    mutationFn: (photoId: string) => setMainSalonPhotoApi(salonId, photoId),
    onSuccess: () => {
      refresh();
      toast.success("Photo principale modifiée");
    },
    onError: (error) => toast.error(adminErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: async (photo: ManagedSalonPhoto) => {
      await deleteSalonPhotoProApi(photo.id);
      // La principale supprimée : la suivante prend sa place (sinon plus de couverture).
      const next = photo.isMain ? photos.find((p) => p.id !== photo.id) : undefined;
      if (next) await setMainSalonPhotoApi(salonId, next.id);
    },
    onSuccess: () => {
      refresh();
      toast.success("Photo supprimée");
    },
    onError: (error) => {
      refresh();
      toast.error(adminErrorMessage(error));
    },
    onSettled: () => setDeleting(null),
  });

  const uploading = uploadingCount > 0;
  const busy = uploading || setMain.isPending || remove.isPending;

  return (
    <div className="flex flex-col gap-3">
      {isLoading ? (
        <div className="flex h-24 items-center justify-center">
          <Loader2 className="size-5 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100">
              <Image
                src={photo.url}
                alt={photo.alt || salonName}
                fill
                sizes="(min-width: 768px) 200px, 50vw"
                className="object-cover"
              />
              {photo.isMain && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-[#53745D] px-2 py-0.5 text-[10px] font-semibold text-white">
                  Principale
                </span>
              )}
              <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1.5">
                {!photo.isMain && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setMain.mutate(photo.id)}
                    className="inline-flex h-8 items-center gap-1 rounded-full bg-black/70 px-2.5 text-xs font-medium text-white hover:bg-black/85 disabled:opacity-50"
                  >
                    <Star className="size-3.5" />
                    Principale
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setDeleting(photo)}
                  aria-label="Supprimer la photo"
                  className="grid size-8 place-items-center rounded-full bg-black/70 text-white hover:bg-black/85 disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}

          {photos.length < SALON_PHOTO_MAX && (
            <label
              aria-label="Ajouter des photos"
              aria-disabled={busy}
              className={cn(
                "flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 text-sm text-slate-500 hover:bg-slate-50 focus-within:ring-2 focus-within:ring-[#53745D]",
                busy && "pointer-events-none opacity-60",
              )}
            >
              {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
              {uploading ? `Envoi… (${uploadingCount})` : "Ajouter"}
              <input
                type="file"
                accept={ACCEPTED.join(",")}
                multiple
                className="sr-only"
                disabled={busy}
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  e.target.value = "";
                  if (files.length) void upload(files);
                }}
              />
            </label>
          )}
        </div>
      )}

      <p className="text-xs text-slate-500">
        PNG, JPG ou WebP, 10 Mo maximum, {SALON_PHOTO_MAX} photos au plus. La photo principale ouvre votre page salon et
        apparaît dans les résultats de recherche.
      </p>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && !remove.isPending && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette photo ?</AlertDialogTitle>
            <AlertDialogDescription>
              Elle disparaît de votre page salon et de l&apos;app.
              {deleting?.isMain && photos.length > 1 ? " La photo suivante deviendra la photo principale." : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={remove.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleting) remove.mutate(deleting);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              {remove.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
