"use client";

import {
  createProductApi,
  deleteProductApi,
  deleteProductPhotoApi,
  getSalonProductOrdersApi,
  getSalonProductsManageApi,
  updateProductApi,
  updateProductOrderStatusApi,
  uploadProductPhotoApi,
} from "@/app/data/services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AdminProduct, AdminProductOrder, ProductPayload } from "./types";

const PRODUCTS_KEY = "admin-salon-products";
const ORDERS_KEY = "admin-salon-product-orders";

const MESSAGES: Record<string, string> = {
  PRODUCT_INVALID_PRICE: "Prix invalide : indiquez un montant supérieur à 0.",
  PRODUCT_INVALID_STOCK: "Stock invalide : nombre entier positif.",
  PRODUCT_INVALID_SERVICES: "Une des prestations choisies n'appartient pas à votre salon.",
  PRODUCT_PHOTO_TOO_LARGE: "Photo trop lourde (5 Mo maximum).",
  PRODUCT_PHOTO_INVALID_TYPE: "Format non accepté : PNG, JPG ou WebP.",
  PRODUCT_PHOTO_LIMIT_REACHED: "6 photos maximum par produit.",
  PRODUCT_ORDER_INVALID_STATUS: "Action impossible : la commande a changé de statut. Rechargez la page.",
  PRODUCT_ORDER_NOT_CANCELLABLE: "Commande déjà remise au client : elle ne peut plus être annulée ici.",
  SALON_UPDATE_FORBIDDEN: "Seul le propriétaire du salon peut gérer la boutique.",
};

/** Erreur axios brute ou enrichie par handleError → message pour le pro. */
export function adminErrorMessage(error: unknown, fallback = "Une erreur est survenue. Réessayez."): string {
  const e = error as {
    response?: { data?: Record<string, unknown> };
    errorDetails?: { responseData?: Record<string, unknown> };
  };
  const data = e?.errorDetails?.responseData ?? e?.response?.data;
  const code = data?.errorCode as string | undefined;
  return (code && MESSAGES[code]) || (data?.message as string | undefined) || fallback;
}

export function useAdminProducts(salonId: string) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, salonId],
    queryFn: async () => {
      const res = await getSalonProductsManageApi(salonId);
      return res.data as { salesEnabled: boolean; products: AdminProduct[] };
    },
    enabled: !!salonId,
  });
}

export function useAdminProductOrders(salonId: string, status?: string) {
  return useQuery({
    queryKey: [ORDERS_KEY, salonId, status ?? "all"],
    queryFn: async () => (await getSalonProductOrdersApi(salonId, status)).data as AdminProductOrder[],
    enabled: !!salonId,
    refetchInterval: 60_000,
  });
}

export function useProductMutations(salonId: string) {
  const queryClient = useQueryClient();
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, salonId] });
    queryClient.invalidateQueries({ queryKey: ["salon-products", salonId] });
  };
  const onError = (error: unknown) => toast.error(adminErrorMessage(error));

  return {
    create: useMutation({
      mutationFn: (data: ProductPayload) => createProductApi(salonId, data),
      onSuccess: () => {
        refresh();
        toast.success("Produit ajouté. Ajoutez maintenant ses photos.");
      },
      onError,
    }),
    update: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ProductPayload> }) =>
        updateProductApi(id, data),
      onSuccess: () => {
        refresh();
        toast.success("Produit enregistré");
      },
      onError,
    }),
    remove: useMutation({
      mutationFn: (id: string) => deleteProductApi(id),
      onSuccess: (res) => {
        refresh();
        toast.success(
          res.data?.deactivated
            ? "Produit déjà commandé : il est retiré de la vente (l'historique est conservé)."
            : "Produit supprimé",
        );
      },
      onError,
    }),
    uploadPhoto: useMutation({
      mutationFn: ({ id, file }: { id: string; file: File }) => uploadProductPhotoApi(id, file),
      onSuccess: refresh,
      onError,
    }),
    deletePhoto: useMutation({
      mutationFn: ({ id, photoId }: { id: string; photoId: string }) => deleteProductPhotoApi(id, photoId),
      onSuccess: refresh,
      onError,
    }),
  };
}

export function useOrderAction(salonId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: "ready" | "picked-up" | "cancel" }) =>
      updateProductOrderStatusApi(id, action),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: [ORDERS_KEY, salonId] });
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY, salonId] });
      toast.success(
        action === "ready"
          ? "Commande marquée prête : le client peut venir la chercher"
          : action === "picked-up"
            ? "Commande remise au client"
            : "Commande annulée, le client est remboursé en entier",
      );
    },
    onError: (error) => toast.error(adminErrorMessage(error)),
  });
}
