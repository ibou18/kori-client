import {
  acceptDeliveryApi,
  addPackageImages,
  addPackageToDeliveryApi,
  addPackageWithImagesToDeliveryApi,
  createConversationApi,
  createDeliveryWithoutPackagesApi,
  createDeliveryWithPackages,
  createReceiverApi,
  estimatePackage,
  getAllDeliveriesByUserApi,
  getAvailableDeliveriesApi,
  getConversationByIdApi,
  getConversationsApi,
  getReceiversApi,
  getTransfers,
  getVerifyEmail,
  sendMessageConversationsApi,
  uploadLogoApi,
  uploadPackageImagesApi,
  verifyPaymentKeyAndPayTravelerApi,
} from "./servicesHop";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getUserApi,
  createUserApi,
  getUsersApi,
  deleteUserApi,
  updateUserApi,
  registerApi,
  inviteUserApi,
  sendMailSupportApi,
} from "./services";

import {
  createDeliveryApi,
  getDeliveriesApi,
  getDeliveryByIdApi,
  updateDeliveryApi,
  updateDeliveryStatusApi,
  deleteDeliveryApi,
  getDeliveryStatsApi,
  getDeliveryByTrackingNumberApi,
  getUserDeliveryHistoryApi,
  getInvoiceByIdApi,
  updateInvoiceApi,
  createInvoiceApi,
  getInvoiceStatsApi,
  updateInvoiceStatusApi,
  deleteInvoiceApi,
  getDetailedInvoiceStatsApi,
  markOverdueInvoicesApi,
  sendInvoiceByEmailApi,
  getInvoicesApi,
  getTripsApi,
  createTripApi,
  deleteTripApi,
  getTripByIdApi,
  getTripStatsApi,
  searchTripsApi,
  updateTripApi,
  updateTripStatusApi,
  getPayementSessionApi,
  getPackagesApi,
  getPackageByIdApi,
  createPackageApi,
  deletePackageApi,
  getPackagesByDeliveryIdApi,
  scanPackageApi,
  updatePackageApi,
  updatePackageStatusApi,
  scanDeliveryQrcode,
  createCheckoutSessionApi,
} from "./servicesHop";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { IUser } from "../interfaceHop";
import {
  GET_CONVERSATIONS,
  GET_DELIVERIES,
  GET_DELIVERY,
  GET_DELIVERY_HISTORY,
  GET_DELIVERY_PACKAGES,
  GET_DELIVERY_STATS,
  GET_DETAILED_INVOICE_STATS,
  GET_INVOICE,
  GET_INVOICE_STATS,
  GET_INVOICES,
  GET_PACKAGE,
  GET_PACKAGES,
  GET_RECEIVERS,
  GET_TRIP,
  GET_TRIPS,
  GET_USERS,
  PAYMENT_SESSION,
  TRIP_STATS,
} from "@/shared/constantes";
import { message } from "antd";

import { InvoiceStatus, PackageFilters, PackageStatus } from "../interfaceHop";
import { toast } from "sonner";
import exp from "constants";

export const useUploadLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, file }: { companyId: string; file: File }) =>
      uploadLogoApi(companyId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      message.success("Logo mis à jour avec succès");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la mise à jour du logo");
      console.error("Error uploading logo:", error);
    },
  });
};

export const useSendMail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMailSupportApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sendMail"] });
    },
    onError: (error) => {
      console.error("Error creating user:", error);
    },
  });
};

export function useVerifyEmail(token: string) {
  return useQuery({
    queryKey: [token],
    queryFn: () => getVerifyEmail(token),
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: !!token,
  });
}

export function useGetPaymentSession(sessionId: string) {
  return useQuery({
    queryKey: [PAYMENT_SESSION, sessionId],
    queryFn: () => getPayementSessionApi(sessionId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: !!sessionId,
  });
}

// Users
export const useGetUsers = () => {
  return useQuery<IUser[], Error>({
    queryKey: [GET_USERS],
    queryFn: getUsersApi,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useGetUser = (id: string) => {
  return useQuery<IUser, Error>({
    queryKey: [GET_USERS, id],
    queryFn: () => getUserApi(id),
    retry: 2,
    refetchOnWindowFocus: true,
    enabled: !!id || false || undefined,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_USERS] });
    },
    onError: (error) => {
      console.error("Error creating user:", error);
    },
  });
};

export const useInviteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_USERS] });
    },
    onError: (error) => {
      console.error("Error creating user:", error);
    },
  });
};

export const useRegisterUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_USERS] });
    },
    onError: (error) => {
      console.error("Error creating user:", error);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_USERS] });
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_USERS] });
    },
    onError: (error) => {
      console.error("Error updating user:", error);
    },
  });
};
//_____ end of users

//_____ Delivery  __________
//_____ Delivery hooks __________

export const useCreateDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDeliveryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_DELIVERIES] });
      message.success("Livraison créée avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de la création de la livraison:", error);
      message.error("Échec de la création de la livraison");
    },
  });
};

export const useGetDeliveries = (filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [GET_DELIVERIES, filters],
    queryFn: () => getDeliveriesApi(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useGetAvailableDeliveries = (filters?: {
  status?: string;
  startDate?: string;
  startCity?: string;
  endCity?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  owned?: string;
}) => {
  return useQuery({
    queryKey: [GET_DELIVERIES, filters],
    queryFn: () => getAvailableDeliveriesApi(filters),
    staleTime: 1000 * 60 * 1, // 1 minute(s)
    retry: 2,
  });
};

export const useGetAllDeliveriesUser = (filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [GET_DELIVERIES, filters],
    queryFn: () => getAllDeliveriesByUserApi(filters),
    staleTime: 1000 * 60 * 1, // 1 minute(s)
    retry: 2,
  });
};

export const useGetDeliveryById = (id: string | undefined) => {
  return useQuery({
    queryKey: [GET_DELIVERY, id],
    queryFn: () => getDeliveryByIdApi(id),
    retry: 2,
    refetchOnWindowFocus: true,
    enabled: !!id,
  });
};

export const useUpdateDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateDeliveryApi(id, data),
    onSuccess: (_, variables) => {
      console.log("variables", variables);
      queryClient.invalidateQueries({ queryKey: [GET_DELIVERIES] });
      queryClient.invalidateQueries({ queryKey: [GET_DELIVERY, variables.id] });
      message.success("Livraison mise à jour avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour de la livraison:", error);
      message.error("Échec de la mise à jour de la livraison");
    },
  });
};

export const useAcceptDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptDeliveryApi,
    onSuccess: (_, variables: any) => {
      queryClient.invalidateQueries({ queryKey: [GET_DELIVERIES] });
      queryClient.invalidateQueries({ queryKey: [GET_DELIVERY, variables.id] });
      message.success("Livraison acceptée avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de l'acceptation de la livraison:", error);
      message.error("Échec de l'acceptation de la livraison");
    },
  });
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateDeliveryStatusApi(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_DELIVERIES] });
      queryClient.invalidateQueries({ queryKey: [GET_DELIVERY, variables.id] });
      message.success("Statut de livraison mis à jour avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour du statut:", error);
      message.error("Échec de la mise à jour du statut de livraison");
    },
  });
};

export const useDeleteDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDeliveryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_DELIVERIES] });
    },
    onError: (error) => {
      console.error("Erreur lors de la suppression de la livraison:", error);
      message.error("Échec de la suppression de la livraison");
    },
  });
};

export const useGetDeliveryStats = (
  period?: "day" | "week" | "month" | "year"
) => {
  return useQuery({
    queryKey: [GET_DELIVERY_STATS, period],
    queryFn: () => getDeliveryStatsApi(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

export const useGetDeliveryByTrackingNumber = (trackingNumber: string) => {
  return useQuery({
    queryKey: [GET_DELIVERY, "tracking", trackingNumber],
    queryFn: () => getDeliveryByTrackingNumberApi(trackingNumber),
    enabled: !!trackingNumber,
    retry: 2,
  });
};

export const useGetUserDeliveryHistory = (filters?: {
  role?: "sender" | "receiver" | "traveler";
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [GET_DELIVERY_HISTORY, filters],
    queryFn: () => getUserDeliveryHistoryApi(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

// _____ Invoices __________
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoiceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_INVOICES] });
      message.success("Facture créée avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de la création de la facture:", error);
      message.error("Échec de la création de la facture");
    },
  });
};

export const useGetInvoices = (filters?: {
  status?: InvoiceStatus;
  userId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [GET_INVOICES, filters],
    queryFn: () => getInvoicesApi(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useGetInvoiceById = (id: string) => {
  return useQuery({
    queryKey: [GET_INVOICE, id],
    queryFn: () => getInvoiceByIdApi(id),
    enabled: !!id,
    retry: 2,
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateInvoiceApi(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_INVOICES] });
      queryClient.invalidateQueries({ queryKey: [GET_INVOICE, variables.id] });
      message.success("Facture mise à jour avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour de la facture:", error);
      message.error("Échec de la mise à jour de la facture");
    },
  });
};

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      updateInvoiceStatusApi(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_INVOICES] });
      queryClient.invalidateQueries({ queryKey: [GET_INVOICE, variables.id] });
      message.success("Statut de la facture mis à jour avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de la mise à jour du statut:", error);
      message.error("Échec de la mise à jour du statut");
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoiceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_INVOICES] });
      message.success("Facture supprimée avec succès");
    },
    onError: (error: any) => {
      console.error("Erreur lors de la suppression de la facture:", error);
      message.error(error.formattedMessage || "Échec de la suppression");
    },
  });
};

export const useGetInvoiceStats = () => {
  return useQuery({
    queryKey: [GET_INVOICE_STATS],
    queryFn: () => getInvoiceStatsApi(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

export const useGetDetailedInvoiceStats = (
  period?: "day" | "week" | "month" | "year"
) => {
  return useQuery({
    queryKey: [GET_DETAILED_INVOICE_STATS, period],
    queryFn: () => getDetailedInvoiceStatsApi(period),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

export const useMarkOverdueInvoices = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markOverdueInvoicesApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_INVOICES] });
      message.success("Factures en retard marquées avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors du marquage des factures en retard:", error);
      message.error("Échec du marquage des factures en retard");
    },
  });
};

export const useSendInvoiceByEmail = () => {
  return useMutation({
    mutationFn: sendInvoiceByEmailApi,
    onSuccess: () => {
      message.success("Facture envoyée par email avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors de l'envoi de la facture par email:", error);
      message.error("Échec de l'envoi de la facture par email");
    },
  });
};

//  __________ TRIP __________
export const useGetTrips = (filters?: any) => {
  return useQuery({
    queryKey: [GET_TRIPS, filters],
    queryFn: () => getTripsApi(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useGetTrip = (id: string) => {
  console.log("id", id);
  return useQuery({
    queryKey: [GET_TRIP, id],
    queryFn: () => getTripByIdApi(id),
    enabled: !!id,
  });
};

export const useCreateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTripApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_TRIPS] });
    },
  });
};

export const useUpdateTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: any) => updateTripApi(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_TRIPS] });
      queryClient.invalidateQueries({ queryKey: [GET_TRIP, variables.id] });
    },
  });
};

export const useUpdateTripStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTripStatusApi,
    onSuccess: (_, variables) => {
      console.log("variables", variables);
      queryClient.invalidateQueries({ queryKey: [GET_TRIPS] });
      queryClient.invalidateQueries({ queryKey: [GET_TRIP, variables.tripId] });
    },
    onError: (error: any) => {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error(
        error?.response?.data?.message ||
          "Erreur lors de la mise à jour du statut"
      );
    },
  });
};

export const useDeleteTrip = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTripApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_TRIPS] });
    },
  });
};

export const useSearchTrips = (filters?: any) => {
  return useQuery({
    queryKey: ["searchTrips", filters],
    queryFn: () => searchTripsApi(filters),
  });
};

export const useGetTripStats = () => {
  return useQuery({
    queryKey: [TRIP_STATS],
    queryFn: getTripStatsApi,
  });
};

//  _______ Package ___________
export const useGetPackages = (filters?: PackageFilters) => {
  return useQuery({
    queryKey: [GET_PACKAGES, filters],
    queryFn: () => getPackagesApi(filters),
  });
};

export const useGetPackage = (id: string) => {
  return useQuery({
    queryKey: [GET_PACKAGE, id],
    queryFn: () => getPackageByIdApi(id),
    enabled: !!id,
  });
};

export const useGetDeliveryPackages = (deliveryId: string) => {
  return useQuery({
    queryKey: [GET_DELIVERY_PACKAGES, deliveryId],
    queryFn: () => getPackagesByDeliveryIdApi(deliveryId),
    enabled: !!deliveryId,
  });
};

export const useCreatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPackageApi,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_PACKAGES] });
      queryClient.invalidateQueries({
        queryKey: [GET_DELIVERY_PACKAGES, variables.deliveryId],
      });
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      updatePackageApi(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GET_PACKAGES] });
      queryClient.invalidateQueries({ queryKey: [GET_PACKAGE, data.id] });
      if (data.deliveryId) {
        queryClient.invalidateQueries({
          queryKey: [GET_DELIVERY_PACKAGES, data.deliveryId],
        });
      }
    },
  });
};

export const useUpdatePackageStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PackageStatus }) =>
      updatePackageStatusApi(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GET_PACKAGES] });
      queryClient.invalidateQueries({ queryKey: [GET_PACKAGE, data.id] });
      if (data.deliveryId) {
        queryClient.invalidateQueries({
          queryKey: [GET_DELIVERY_PACKAGES, data.deliveryId],
        });
      }
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePackageApi,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_PACKAGES] });
      // Puisque nous n'avons pas la deliveryId après suppression, nous devons rafraîchir plus généralement
      queryClient.invalidateQueries({ queryKey: [GET_DELIVERY_PACKAGES] });
      toast.success("Colis supprimé avec succès");
    },
    onError: (error: any) => {
      console.error("Erreur lors de la suppression du colis:", error);

      // Extraction du message d'erreur, peu importe sa structure
      const errorMessage =
        error?.response?.data?.message || // Structure standard axios
        error?.message || // Message d'erreur direct
        error?.error || // Autre structure possible
        "Erreur lors de la suppression du colis"; // Message par défaut

      toast.error(errorMessage, {
        description:
          error?.response?.data?.error && `${error?.response?.data?.error}`,
        duration: 8000,
      });
    },
  });
};

export const useScanPackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, location }: { id: string; location?: string }) =>
      scanPackageApi(id, location),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [GET_PACKAGES] });
      queryClient.invalidateQueries({
        queryKey: [GET_PACKAGE, data.package.id],
      });
      if (data.package.deliveryId) {
        queryClient.invalidateQueries({
          queryKey: [GET_DELIVERY_PACKAGES, data.package.deliveryId],
        });
      }
    },
  });
};

export const useGetDeliveryQrcode = (trackingNumber: string) => {
  return useQuery({
    queryKey: [GET_DELIVERY, trackingNumber],
    queryFn: () => scanDeliveryQrcode(trackingNumber),
  });
};

export const handlePaymentClick = async (data: any) => {
  try {
    const session = await createCheckoutSessionApi(data);
    if (session) {
      // Rediriger l'utilisateur vers l'URL de la session de paiement
      window.location.href = session.url;
    } else {
      // Gérer l'erreur
      console.error("Erreur lors de la création de la session de paiement");
    }
  } catch (error) {
    console.error(
      "Erreur lors de la création de la session de paiement:",
      error
    );
  }
};

export const useGetTransefers = () => {
  return useQuery({
    queryKey: ["GET_TRANSFERS"],
    queryFn: () => getTransfers(),
  });
};

export const useGetReceivers = () => {
  return useQuery({
    queryKey: [GET_RECEIVERS],
    queryFn: () => getReceiversApi(),
  });
};

// Create receiver
export const useCreateReceiver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReceiverApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_RECEIVERS] });
      queryClient.invalidateQueries({ queryKey: [GET_USERS] });
      toast.success("Destinataire créé avec succès");
    },
    onError: (error: any) => {
      console.error("Erreur lors de la création du destinataire:", error);
      toast.error(
        error?.response?.data?.message ||
          "Erreur lors de la création du destinataire"
      );
    },
  });
};

// À ajouter dans votre fichier de hooks React Query

// Hook pour créer une livraison sans colis
export const useCreateDeliveryWithoutPackages = () => {
  return useMutation({
    mutationFn: createDeliveryWithoutPackagesApi,
    onError: (error) => {
      console.error("Erreur lors de la création de la livraison :", error);
    },
  });
};

// Hook pour ajouter un colis avec images à une livraison
export const useAddPackageWithImagesToDelivery = () => {
  return useMutation({
    mutationFn: ({
      deliveryId,
      packageData,
      imageFiles,
    }: {
      deliveryId: string;
      packageData: any;
      imageFiles: File[];
    }) =>
      addPackageWithImagesToDeliveryApi(deliveryId, packageData, imageFiles),
    onError: (error) => {
      console.error("Erreur lors de l'ajout du colis avec images :", error);
    },
  });
};

// Hook pour ajouter un colis à une livraison
export const useAddPackageToDelivery = () => {
  return useMutation({
    mutationFn: ({
      deliveryId,
      packageData,
    }: {
      deliveryId: string;
      packageData: any;
    }) => addPackageToDeliveryApi(deliveryId, packageData),
    onError: (error) => {
      console.error("Erreur lors de l'ajout du colis :", error);
    },
  });
};

// Hook pour uploader des images pour un colis existant
export const useUploadPackageImages = () => {
  return useMutation({
    mutationFn: ({
      packageId,
      imageFiles,
      titles,
    }: {
      packageId: string;
      imageFiles: File[];
      titles?: string[];
    }) => uploadPackageImagesApi(packageId, imageFiles, titles),
    onError: (error) => {
      console.error("Erreur lors de l'upload des images :", error);
    },
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversationApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_CONVERSATIONS] });
    },
    onError: (error) => {
      console.error("Erreur lors de la création de la conversation:", error);
    },
  });
};

export const useGetConversations = () => {
  return useQuery({
    queryKey: [GET_CONVERSATIONS],
    queryFn: getConversationsApi,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useGetConversationById = (id: string) => {
  return useQuery({
    queryKey: [GET_CONVERSATIONS, id],
    queryFn: () => getConversationByIdApi(id),
    enabled: !!id,
    retry: 2,
  });
};

export const useSendMessageConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessageConversationsApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [GET_CONVERSATIONS, variables.id],
      });
    },
    onError: (error) => {
      console.error("Erreur lors de l'envoi du message:", error);
    },
  });
};

export const useEstimatePackage = () => {
  return useMutation({
    mutationFn: estimatePackage,
    onSuccess: () => {
      toast.success("Estimation du colis réussie");
    },
    onError: (error: any) => {
      message.error(error.message || "Erreur lors de l'estimation du colis");
      console.error("estimatePackage error:", error);
    },
  });
};

export const useCreateDeliveryWithPackages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDeliveryWithPackages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_DELIVERIES] });
      message.success("Livraison avec colis créée avec succès");
    },
    onError: (error: any) => {
      message.error(
        error.message || "Erreur lors de la création de la livraison"
      );
      console.error("createDeliveryWithPackages error:", error);
    },
  });
};

export const useAddPackageImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPackageImages,
    onSuccess: (
      _,
      variables: { packageId: string; images: FileList | File[] }
    ) => {
      queryClient.invalidateQueries({
        queryKey: [GET_PACKAGE, variables.packageId],
      });
    },
    onError: (error: any) => {
      message.error(error.message || "Erreur lors de l'ajout des images");
      console.error("addPackageImages error:", error);
    },
  });
};

export const useVerifyPaymentKeyAndPayTraveler = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyPaymentKeyAndPayTravelerApi,
    onSuccess: (_, variables) => {
      console.log("variables", variables);
      queryClient.invalidateQueries({ queryKey: [GET_INVOICES] });
      toast.success("Paiement vérifié et traité avec succès");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la vérification de la clé de paiement");
      console.error("verifyPaymentKeyAndPayTraveler error:", error);
    },
  });
};
