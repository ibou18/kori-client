/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createPlanApi,
  createUserApi,
  deletePlanApi,
  deleteUserApi,
  forgotPasswordApi,
  getPlanApi,
  getProductsApi,
  getUserApi,
  getUserByTokenApi,
  getUsersApi,
  resetPasswordApi,
  updatePlanApi,
  updateUserApi,
  checkoutStripeApi,
  registerApi,
  getSmsApi,
  sendSmsApi,
  sendSmsBulkApi,
  getInvoicesApi,
  getStatsInvoicesApi,
  getClientsApi,
  createInvoiceApi,
  updateInvoiceApi,
  deleteInvoiceApi,
  getInvoiceApi,
  createReceiptApi,
  deleteReceiptApi,
  getReceiptApi,
  getReceiptsApi,
  getReceiptTaxesApi,
  createClientApi,
  getTrackingsApi,
  getTrackingApi,
  createTrackingApi,
  updateTrackingApi,
  deleteTrackingApi,
  getStatsApi,
  getSubscriptionsApi,
  getPortalBillingApi,
  getCurrentStatusApi,
  updateClientApi,
  currentSubscriptionApi,
  inviteUserApi,
  getSubscriptionsByCessionApi,
  uploadLogoApi,
  sendMailSupportApi,
  sendInvoiceApi,
  getSettingsApi,
  updateSettingApi,
  getCompaniesApi,
  getCompanyApi,
  deleteCompanyApi,
  createSubscriptionApi,
  getLimitsCheckApi,
} from "./services";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  IInvoice,
  ILimitsCheckResponse,
  IPlan,
  ITaxes,
  IUser,
} from "../interface";
import {
  GET_PLANS,
  GET_USERS,
  GET_USERS_BY_TOKEN,
  GET_SMS,
  GET_INVOICES_STATS,
  GET_INVOICES,
  GET_CLIENTS,
  GET_RECEIPTS,
  GET_RECEIPTS_TAXES,
  GET_RECEIPTS_STATS,
  GET_TRACKINGS,
  GET_TRACKING_STATS,
  GET_SUBSCRIPTIONS,
  GET_PORTAL,
  GET_CURRENT_STATUS,
  GET_SETTINGS,
  GET_COMPANIES,
  GET_COMPANY,
  GET_LIMIT_CHECK,
} from "@/shared/constantes";
import { message } from "antd";

import queryClient from "@/config/reactQueryConfig";
import axios from "axios";

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

// Plans
// Hook pour récupérer tous les plans
export const useGetProductsApi = () => {
  return useQuery<any, Error>({
    queryKey: [GET_PLANS],
    queryFn: getProductsApi,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook pour récupérer un plan spécifique
export const useGetPlan = (id: string) => {
  return useQuery<IPlan, Error>({
    queryKey: [GET_PLANS, id],
    queryFn: () => getPlanApi(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};

// Hook pour créer un plan
export const useCreatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlanApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_PLANS] });
    },
    onError: (error) => {
      console.error("Error creating plan:", error);
    },
  });
};

// Hook pour mettre à jour un plan
export const useUpdatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePlanApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_PLANS] });
    },
    onError: (error) => {
      console.error("Error deleting plan:", error);
    },
  });
};

// Hook pour supprimer un plan
export const useDeletePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePlanApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_PLANS] });
    },
    onError: (error) => {
      console.error("Error deleting plan:", error);
    },
  });
};

//_____ end of plans

// Forgot password  Hook
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: () => {
      console.log("Password reset email sent");
    },
    onError: (error) => {
      console.error("Error sending password reset email", error);
    },
  });
};

export const useGetUsersbyToken = (token: string) => {
  return useQuery<IUser[], Error>({
    queryKey: [GET_USERS_BY_TOKEN],
    queryFn: () => getUserByTokenApi(token),
    retry: 2,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};

//reset password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => {
      console.log("Password reset email sent");
    },
    onError: (error) => {
      console.error("Error sending password reset email", error);
    },
  });
};

// ******* Checkout Stripe ***********
// Hook pour créer une session stripe
export const useCheckoutStripeApi = () => {
  return useMutation({
    mutationFn: checkoutStripeApi,
    onSuccess: () => {
      console.log("Stripe session created successfully");
    },
    onError: (error) => {
      console.error("Error creating stripe session:", error);
    },
  });
};

export const useGetCurrentSubscription = () => {
  return useQuery<any, Error>({
    queryKey: [GET_CURRENT_STATUS],
    queryFn: currentSubscriptionApi,
  });
};

export const useGetSms = () => {
  return useQuery<any, Error>({
    queryKey: [GET_SMS],
    queryFn: getSmsApi,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // refetchOnMount: true,
  });
};

export const useSendSms = () => {
  return useMutation({
    mutationFn: sendSmsApi,
    onSuccess: () => {
      console.log("SMS envoyé avec succès !");
    },
    onError: (error) => {
      console.error("Erreur lors de l'envoi du SMS:", error);
    },
  });
};

export const useSendBulkSms = () => {
  return useMutation({
    mutationFn: sendSmsBulkApi,
    onSuccess: () => {
      console.log("SMS envoyé avec succès !");
    },
    onError: (error) => {
      console.error("Erreur lors de l'envoi du SMS:", error);
    },
  });
};

// ******* INVOICES *******

//Send Invoice
export const useSendInvoice = () => {
  return useMutation({
    mutationFn: sendInvoiceApi,
    onSuccess: () => {
      console.log("Invoice sent successfully !");
    },
    onError: (error) => {
      console.error("Error sending invoice:", error);
    },
  });
};

// Create INVOICE
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInvoiceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_INVOICES] });
      message.success("Facture créée avec succès !");
    },
    onError: (error: any) => {
      message.error(error.message || "Erreur lors de la création");
      console.error("Error creating Invoice:", error);
    },
  });
};

// Hook pour récupérer toutes les factures
export const useGetInvoices = () => {
  return useQuery<any, Error>({
    queryKey: [GET_INVOICES],
    queryFn: () => getInvoicesApi(),
    staleTime: 0,
    refetchOnMount: true,
  });
};

// STATS INVOICES
export const useGetStatsInvoices = () => {
  return useQuery<any, Error>({
    queryKey: [GET_INVOICES_STATS],
    queryFn: () => getStatsInvoicesApi(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook pour récupérer une facture spécifique
export const useGetInvoice = (id: string) => {
  return useQuery<IInvoice, Error>({
    queryKey: [GET_INVOICES, id],
    queryFn: () => getInvoiceApi(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};

// UPDATE INVOICE
export const useUpdateInvoice = () => {
  return useMutation({
    mutationFn: updateInvoiceApi,
    onSuccess: () => {
      message.success("Facture mise à jour avec succès !");
      queryClient.invalidateQueries({ queryKey: [GET_INVOICES] });
    },
  });
};

// DELETE INVOICE
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoiceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_INVOICES] });
      message.success("Facture supprimée avec succès !");
    },
    onError: (error: any) => {
      message.error(error.message || "Erreur lors de la suppression");
      console.error("Error deleting Invoice:", error);
    },
  });
};

// ******* End INVOICES *******

// ******* Clients *******
// create client
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClientApi,
    onSuccess: () => {
      message.success("Client added successfully");
      queryClient.invalidateQueries({ queryKey: [GET_CLIENTS] });
    },
    onError: (error) => {
      console.error("Error adding client:", error);
      message.error("Error adding client");
    },
  });
};

// Hook pour récupérer tous les clients
export const useGetClients = () => {
  return useQuery<any, Error>({
    queryKey: [GET_CLIENTS],
    queryFn: () => getClientsApi(),
  });
};

// Hook pour récupérer un client spécifique
export const useGetClient = (id: string) => {
  return useQuery<IUser, Error>({
    queryKey: [GET_CLIENTS, id],
    queryFn: () => getUserApi(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
};

// Hook pour supprimer un client
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_CLIENTS] });
      message.success("Client supprimé avec succès !");
    },
    onError: (error: any) => {
      message.error(error.message || "Erreur lors de la suppression");
      console.error("Error deleting Client:", error);
    },
  });
};
// update client
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateClientApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_CLIENTS] });
      message.success("🎉Client updated Successfully !");
    },
    onError: (error: any) => {
      message.error(error.message || "Erreur lors de la mise à jour");
      console.error("Error updating Client:", error);
    },
  });
};
// ******* End Clients *******

// ******* Receipts *******
// Create Receipt
export const useCreateReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReceiptApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_RECEIPTS] });
      message.success("Reçu créé avec succès !");
    },
    onError: (error: any) => {
      message.error(error.message);
      console.error("Error creating Receipt:", error);
    },
  });
};

export const useReceiptStats = () => {
  return useQuery<any, Error>({
    queryKey: [GET_RECEIPTS_STATS],
    queryFn: () => getReceiptsApi(),
    staleTime: 0,
    refetchOnMount: true,
  });
};

// Hook pour récupérer tous les reçus
export const useGetReceipts = () => {
  return useQuery<any, Error>({
    queryKey: [GET_RECEIPTS],
    queryFn: () => getReceiptsApi(),
    staleTime: 0,
    refetchOnMount: true,
  });
};

// Hook pour récupérer un reçu spécifique
export const useGetReceipt = (id: string) => {
  return useQuery<IInvoice, Error>({
    queryKey: [GET_RECEIPTS, id],
    queryFn: () => getReceiptApi(id),
    enabled: !!id,
  });
};

// Hook pour récupérer un reçu spécifique
export const useGetReceiptTaxes = () => {
  return useQuery<ITaxes, Error>({
    queryKey: [GET_RECEIPTS_TAXES],
    queryFn: () => getReceiptTaxesApi(),
    staleTime: 20, // 20 seconds
  });
};

// Hook pour supprimer un reçu
export const useDeleteReceipt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReceiptApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_RECEIPTS] });
    },
    onError: (error: any) => {
      message.error(error.message || "Erreur lors de la suppression");
      console.error("Error deleting Receipt:", error);
    },
  });
};

// ******* End Receipts *******

// ******* Trackings *******
// ******* Trackings *******
// Hook pour récupérer tous les trackings
export const useGetTrackings = () => {
  return useQuery<any, Error>({
    queryKey: [GET_TRACKINGS],
    queryFn: getTrackingsApi,
  });
};

// Hook pour récupérer un tracking spécifique
export const useGetTracking = () => {
  return useQuery<any, Error>({
    queryKey: [GET_TRACKINGS],
    queryFn: () => getTrackingApi(),
  });
};

// Hook pour créer un tracking
export const useCreateTracking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTrackingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_TRACKINGS] });
      message.success("Tracking créé avec succès !");
    },
    onError: (error: any) => {
      message.error(error.message || "Erreur lors de la création");
      console.error("Error creating tracking:", error);
    },
  });
};

// Hook pour mettre à jour un tracking
export const useUpdateTracking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTrackingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_TRACKINGS] });
      message.success("Tracking mis à jour avec succès !");
    },
    onError: (error: any) => {
      message.error(error.message || "Erreur lors de la mise à jour");
      console.error("Error updating tracking:", error);
    },
  });
};

// Hook pour supprimer un tracking
export const useDeleteTracking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTrackingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_TRACKINGS] });
      message.success("Tracking supprimé avec succès !");
    },
    onError: (error: any) => {
      message.error(error.message || "Erreur lors de la suppression");
      console.error("Error deleting tracking:", error);
    },
  });
};

// Hook pour les statistiques
export const useGetTrackingStats = () => {
  return useQuery<any, Error>({
    queryKey: [GET_TRACKING_STATS],
    queryFn: getStatsApi,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
};

// ******* End Trackings *******

// ******* Subscriptions *******
export const useGetSubscriptions = () => {
  return useQuery<any, Error>({
    queryKey: [GET_SUBSCRIPTIONS],
    queryFn: getSubscriptionsApi,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubscriptionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SUBSCRIPTIONS] });
      message.success("Abonnement créé avec succès!");
    },
    onError: (error: any) => {
      message.error(
        error.message || "Erreur lors de la création de l'abonnement"
      );
      console.error("Error creating subscription:", error);
    },
  });
};

export const useGetPortalBilling = () => {
  return useQuery<any, Error>({
    queryKey: [GET_PORTAL],
    queryFn: getPortalBillingApi,
  });
};

export const useGetCurrentStatusApi = () => {
  return useQuery<any, Error>({
    queryKey: [GET_CURRENT_STATUS],
    queryFn: getCurrentStatusApi,
  });
};

export const useGetSubscriptionByCSession = (id: string) => {
  return useQuery<any, Error>({
    queryKey: [GET_CURRENT_STATUS],
    queryFn: () => getSubscriptionsByCessionApi(id),
  });
};

export const useGetSettings = () => {
  return useQuery<any, Error>({
    queryKey: [GET_SETTINGS],
    queryFn: () => getSettingsApi(),
  });
};

export const useUpdateSetting = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSettingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SETTINGS] });
      message.success("Setting mis à jour avec succès !");
    },
    onError: (error: any) => {
      message.error(error.message || "Erreur lors de la mise à jour");
      console.error("Error updating setting:", error);
    },
  });
};

export const useGetCompanies = () => {
  return useQuery<any, Error>({
    queryKey: [GET_COMPANIES],
    queryFn: () => getCompaniesApi(),
  });
};

export const useGetCompany = (id: string) => {
  return useQuery<any, Error>({
    queryKey: [GET_COMPANY, id],
    queryFn: () => getCompanyApi(id),
  });
};

export const useGetLimitcheck = () => {
  return useQuery<ILimitsCheckResponse, Error>({
    queryKey: [GET_LIMIT_CHECK],
    queryFn: () => getLimitsCheckApi(),
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCompanyApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_COMPANIES] });
      message.success("Company supprimé avec succès !");
    },
    onError: (error: any) => {
      message.error(error.message || "Erreur lors de la suppression");
      console.error("Error deleting company:", error);
    },
  });
};
