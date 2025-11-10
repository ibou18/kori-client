/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  GET_BOOKING,
  GET_BOOKINGS,
  GET_DEFAULT_SERVICES,
  GET_MY_SALON,
  GET_PAYOUTS,
  GET_PLATFORM_CONFIG,
  GET_RATINGS,
  GET_REVIEW,
  GET_REVIEWS,
  GET_SALON,
  GET_SALON_AVAILABILITY,
  GET_SALON_BOOKING_AVAILABILITY,
  GET_SALON_DASHBOARD_STATS,
  GET_SALON_HOLIDAYS,
  GET_SALON_PHOTOS,
  GET_SALON_RATING_STATS,
  GET_SALON_SERVICE,
  GET_SALON_SERVICES,
  GET_SALON_STATS,
  GET_SALON_TYPES,
  GET_SALONS,
  GET_SERVICE_CATEGORIES,
  GET_SERVICE_OPTIONS,
  GET_STRIPE_CONFIG,
  GET_USERS,
} from "@/shared/constantes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  applyDefaultServicesApi,
  bulkCreateServiceOptionsApi,
  bulkDeleteUsersApi,
  calculateTaxesApi,
  // Cancellations
  cancelBookingApi,
  confirmPaymentApi,
  contactApi,
  createBookingApi,
  createCheckoutSessionApi,
  createDefaultServiceApi,
  createPaymentIntentApi,
  // Ratings
  createRatingApi,
  createReviewApi,
  createSalonApi,
  createSalonHolidayApi,
  createSalonServiceApi,
  createServiceOptionApi,
  // Stripe Connect
  createStripeConnectAccountApi,
  createUserApi,
  deleteReviewApi,
  deleteSalonApi,
  deleteSalonHolidayApi,
  deleteSalonPhotoApi,
  deleteSalonServiceApi,
  deleteServiceOptionApi,
  deleteUserApi,
  forgotPasswordApi,
  // Stats
  getAdminStatsApi,
  getBookingApi,
  // Payouts
  getBookingPayoutApi,
  // Bookings
  getBookingsApi,
  getCheckoutSessionApi,
  getClientBookingsApi,
  // Default Services
  getDefaultServicesApi,
  getMeApi,
  getMySalonApi,
  getNearestSalonsApi,
  // Platform Config
  getPlatformConfigApi,
  getReviewApi,
  // Reviews
  getReviewsApi,
  getSalonApi,
  // Salon Availability
  getSalonAvailabilityApi,
  getSalonAvailabilityRangeApi,
  getSalonBookingAvailabilityApi,
  getSalonBookingsApi,
  getSalonDashboardStatsApi,
  // Salon Holidays
  getSalonHolidaysApi,
  getSalonMonthlyRevenueApi,
  getSalonPendingPayoutsApi,
  getSalonPhotosApi,
  getSalonRatingsApi,
  getSalonRatingStatsApi,
  getSalonReviewsApi,
  // Salons
  getSalonsApi,
  getSalonServiceApi,
  getSalonServicesApi,
  // Salon Services
  getSalonServicesListApi,
  getSalonStatsApi,
  // Salon Types
  getSalonTypesApi,
  // Service Categories
  getServiceCategoriesApi,
  getServiceOptionApi,
  // Service Options
  getServiceOptionsApi,
  // Payments
  getStripeConfigApi,
  getStripeConnectAccountStatusApi,
  getUserApi,
  getUserPreferencesApi,
  // Users
  getUsersApi,
  getUsersbyTokenApi,
  getUserStatsApi,
  // Auth
  loginApi,
  markBookingAsNoShowApi,
  processBookingPayoutApi,
  reactivateSalonServiceApi,
  registerApi,
  registerSalonApi,
  reportReviewApi,
  resetPasswordApi,
  searchSalonsApi,
  updateBookingApi,
  updateDefaultServiceApi,
  updatePlatformConfigApi,
  updateReviewApi,
  updateSalonApi,
  updateSalonHolidayApi,
  updateSalonServiceApi,
  updateServiceCategoryApi,
  updateServiceOptionApi,
  updateUserApi,
  updateUserPreferencesApi,
  updateUserProfileApi,
  // Photos
  uploadSalonPhotoApi,
  uploadServicePhotoApi,
  verifyEmailApi,
} from "./services";

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

export const useLogin = () => {
  return useMutation({
    mutationFn: loginApi,
    onSuccess: () => {
      message.success("Connexion réussie !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la connexion");
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_USERS] });
      message.success("Inscription réussie !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de l'inscription");
    },
  });
};

export const useRegisterSalon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: registerSalonApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SALONS] });
      message.success("Inscription du salon réussie !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de l'inscription du salon");
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: () => {
      message.success("Email de réinitialisation envoyé !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de l'envoi de l'email");
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: () => {
      message.success("Mot de passe réinitialisé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la réinitialisation");
    },
  });
};

export const useVerifyEmail = (token: string | null) => {
  return useQuery({
    queryKey: ["verify-email", token],
    queryFn: () => verifyEmailApi(token!),
    enabled: !!token,
    retry: false,
  });
};

export const useGetUsersbyToken = (token: string | null) => {
  return useQuery({
    queryKey: ["user-by-token", token],
    queryFn: () => getUsersbyTokenApi(token!),
    enabled: !!token,
    retry: false,
  });
};

export const useGetMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMeApi,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      // ✅ Ne pas réessayer si c'est une erreur 401 (non authentifié)
      if (error?.response?.status === 401) {
        return false;
      }
      // Réessayer une seule fois pour les autres erreurs
      return failureCount < 1;
    },
    retryOnMount: false,
    refetchOnWindowFocus: false,
  });
};

// ============================================================================
// USERS HOOKS
// ============================================================================

export const useGetUsers = () => {
  return useQuery({
    queryKey: [GET_USERS],
    queryFn: getUsersApi,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useGetUser = (id: string) => {
  return useQuery({
    queryKey: [GET_USERS, id],
    queryFn: () => getUserApi(id),
    enabled: !!id,
    retry: 2,
    refetchOnWindowFocus: true,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_USERS] });
      message.success("Utilisateur créé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la création");
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_USERS] });
      queryClient.invalidateQueries({ queryKey: [GET_USERS, variables.id] });
      message.success("Utilisateur mis à jour avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la mise à jour");
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserProfileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      message.success("Profil mis à jour avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la mise à jour");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_USERS] });
      message.success("Utilisateur supprimé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la suppression");
    },
  });
};

export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteUsersApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_USERS] });
      message.success("Utilisateurs supprimés avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la suppression en masse");
    },
  });
};

export const useGetUserStats = () => {
  return useQuery({
    queryKey: ["user-stats"],
    queryFn: getUserStatsApi,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetUserPreferences = () => {
  return useQuery({
    queryKey: ["user-preferences"],
    queryFn: getUserPreferencesApi,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUserPreferencesApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-preferences"] });
      message.success("Préférences mises à jour avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la mise à jour");
    },
  });
};

export const useContact = () => {
  return useMutation({
    mutationFn: contactApi,
    onSuccess: () => {
      message.success("Message envoyé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de l'envoi");
    },
  });
};

export const useSendMail = () => {
  return useMutation({
    mutationFn: contactApi,
    onSuccess: () => {
      message.success("Message envoyé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de l'envoi");
    },
  });
};

// ============================================================================
// SALONS HOOKS
// ============================================================================

export const useGetSalons = (params?: {
  limit?: number;
  offset?: number;
  salonType?: string;
  city?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: [GET_SALONS, params],
    queryFn: () => getSalonsApi(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

export const useGetSalon = (id: string) => {
  return useQuery({
    queryKey: [GET_SALON, id],
    queryFn: () => getSalonApi(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

export const useCreateSalon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSalonApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SALONS] });
      queryClient.invalidateQueries({ queryKey: [GET_MY_SALON] });
      message.success("Salon créé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la création");
    },
  });
};

export const useUpdateSalon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSalonApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_SALONS] });
      queryClient.invalidateQueries({ queryKey: [GET_SALON, variables.id] });
      queryClient.invalidateQueries({ queryKey: [GET_MY_SALON] });
      message.success("Salon mis à jour avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la mise à jour");
    },
  });
};

export const useDeleteSalon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSalonApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SALONS] });
      queryClient.invalidateQueries({ queryKey: [GET_MY_SALON] });
      message.success("Salon supprimé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la suppression");
    },
  });
};

export const useGetMySalon = () => {
  return useQuery({
    queryKey: [GET_MY_SALON],
    queryFn: getMySalonApi,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

export const useGetSalonServices = (salonId: string) => {
  return useQuery({
    queryKey: [GET_SALON_SERVICES, salonId],
    queryFn: () => getSalonServicesApi(salonId),
    enabled: !!salonId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetSalonReviews = (salonId: string) => {
  return useQuery({
    queryKey: [GET_REVIEWS, salonId],
    queryFn: () => getSalonReviewsApi(salonId),
    enabled: !!salonId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetSalonStats = (salonId: string) => {
  return useQuery({
    queryKey: [GET_SALON_STATS, salonId],
    queryFn: () => getSalonStatsApi(salonId),
    enabled: !!salonId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useSearchSalons = (params: {
  query?: string;
  salonType?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: [GET_SALONS, "search", params],
    queryFn: () => searchSalonsApi(params),
    enabled: !!(params.query || params.city || params.latitude),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useGetNearestSalons = (params: {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: [GET_SALONS, "nearest", params],
    queryFn: () => getNearestSalonsApi(params),
    enabled: !!params.latitude && !!params.longitude,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// ============================================================================
// SALON AVAILABILITY HOOKS
// ============================================================================

export const useGetSalonAvailability = (salonId: string, date: string) => {
  return useQuery({
    queryKey: [GET_SALON_AVAILABILITY, salonId, date],
    queryFn: () => getSalonAvailabilityApi(salonId, date),
    enabled: !!salonId && !!date,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useGetSalonBookingAvailability = (
  salonId: string,
  date: string,
  duration: number
) => {
  return useQuery({
    queryKey: [GET_SALON_BOOKING_AVAILABILITY, salonId, date, duration],
    queryFn: () => getSalonBookingAvailabilityApi(salonId, date, duration),
    enabled: !!salonId && !!date && !!duration,
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useGetSalonAvailabilityRange = (
  salonId: string,
  startDate: string,
  endDate: string
) => {
  return useQuery({
    queryKey: [GET_SALON_AVAILABILITY, salonId, "range", startDate, endDate],
    queryFn: () => getSalonAvailabilityRangeApi(salonId, startDate, endDate),
    enabled: !!salonId && !!startDate && !!endDate,
    staleTime: 1000 * 60, // 1 minute
  });
};

// ============================================================================
// BOOKINGS HOOKS
// ============================================================================

export const useGetBookings = (params?: {
  status?: string;
  clientId?: string;
  salonId?: string;
  isHomeService?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: [GET_BOOKINGS, params],
    queryFn: () => getBookingsApi(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
};

export const useGetBooking = (id: string) => {
  return useQuery({
    queryKey: [GET_BOOKING, id],
    queryFn: () => getBookingApi(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBookingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_BOOKINGS] });
      message.success("Réservation créée avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la création");
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBookingApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_BOOKINGS] });
      queryClient.invalidateQueries({ queryKey: [GET_BOOKING, variables.id] });
      message.success("Réservation mise à jour avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la mise à jour");
    },
  });
};

export const useGetClientBookings = (
  clientId: string,
  params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }
) => {
  return useQuery({
    queryKey: [GET_BOOKINGS, "client", clientId, params],
    queryFn: () => getClientBookingsApi(clientId, params),
    enabled: !!clientId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useGetSalonBookings = (
  salonId: string,
  params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }
) => {
  return useQuery({
    queryKey: [GET_BOOKINGS, "salon", salonId, params],
    queryFn: () => getSalonBookingsApi(salonId, params),
    enabled: !!salonId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// ============================================================================
// PAYMENTS HOOKS
// ============================================================================

export const useGetStripeConfig = () => {
  return useQuery({
    queryKey: [GET_STRIPE_CONFIG],
    queryFn: getStripeConfigApi,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: createCheckoutSessionApi,
    onSuccess: () => {
      message.success("Session de paiement créée !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la création");
    },
  });
};

export const useGetCheckoutSession = (sessionId: string) => {
  return useQuery({
    queryKey: ["checkout-session", sessionId],
    queryFn: () => getCheckoutSessionApi(sessionId),
    enabled: !!sessionId,
  });
};

export const useCreatePaymentIntent = () => {
  return useMutation({
    mutationFn: createPaymentIntentApi,
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la création");
    },
  });
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: confirmPaymentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_BOOKINGS] });
      message.success("Paiement confirmé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la confirmation");
    },
  });
};

export const useCalculateTaxes = () => {
  return useMutation({
    mutationFn: calculateTaxesApi,
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors du calcul");
    },
  });
};

// ============================================================================
// SALON SERVICES HOOKS
// ============================================================================

export const useGetSalonServicesList = (params?: {
  salonId?: string;
  categoryId?: string;
  isActive?: boolean;
}) => {
  return useQuery({
    queryKey: [GET_SALON_SERVICES, params],
    queryFn: () => getSalonServicesListApi(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetSalonService = (serviceId: string) => {
  return useQuery({
    queryKey: [GET_SALON_SERVICE, serviceId],
    queryFn: () => getSalonServiceApi(serviceId),
    enabled: !!serviceId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateSalonService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSalonServiceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SALON_SERVICES] });
      message.success("Service créé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la création");
    },
  });
};

export const useUpdateSalonService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSalonServiceApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_SALON_SERVICES] });
      queryClient.invalidateQueries({
        queryKey: [GET_SALON_SERVICE, variables.serviceId],
      });
      message.success("Service mis à jour avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la mise à jour");
    },
  });
};

export const useReactivateSalonService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reactivateSalonServiceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SALON_SERVICES] });
      message.success("Service réactivé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la réactivation");
    },
  });
};

export const useDeleteSalonService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSalonServiceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SALON_SERVICES] });
      message.success("Service supprimé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la suppression");
    },
  });
};

// ============================================================================
// SERVICE OPTIONS HOOKS
// ============================================================================

export const useGetServiceOptions = (params?: {
  serviceId?: string;
  salonId?: string;
  optionType?: string;
}) => {
  return useQuery({
    queryKey: [GET_SERVICE_OPTIONS, params],
    queryFn: () => getServiceOptionsApi(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetServiceOption = (id: string) => {
  return useQuery({
    queryKey: [GET_SERVICE_OPTIONS, id],
    queryFn: () => getServiceOptionApi(id),
    enabled: !!id,
  });
};

export const useCreateServiceOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createServiceOptionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SERVICE_OPTIONS] });
      message.success("Option créée avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la création");
    },
  });
};

export const useUpdateServiceOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateServiceOptionApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_SERVICE_OPTIONS] });
      queryClient.invalidateQueries({
        queryKey: [GET_SERVICE_OPTIONS, variables.id],
      });
      message.success("Option mise à jour avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la mise à jour");
    },
  });
};

export const useDeleteServiceOption = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteServiceOptionApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SERVICE_OPTIONS] });
      message.success("Option supprimée avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la suppression");
    },
  });
};

export const useBulkCreateServiceOptions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bulkCreateServiceOptionsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SERVICE_OPTIONS] });
      message.success("Options créées avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la création");
    },
  });
};

// ============================================================================
// SERVICE CATEGORIES HOOKS
// ============================================================================

export const useGetServiceCategories = () => {
  return useQuery({
    queryKey: [GET_SERVICE_CATEGORIES],
    queryFn: getServiceCategoriesApi,
    staleTime: 1000 * 60 * 60, // 1 hour (rarely changes)
  });
};

export const useUpdateServiceCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateServiceCategoryApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SERVICE_CATEGORIES] });
      queryClient.invalidateQueries({ queryKey: [GET_DEFAULT_SERVICES] });
      message.success("Catégorie mise à jour avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la mise à jour");
    },
  });
};

// ============================================================================
// DEFAULT SERVICES HOOKS
// ============================================================================

export const useGetDefaultServices = (params?: {
  salonType?: string;
  categoryId?: string;
  group?: string;
}) => {
  return useQuery({
    queryKey: [GET_DEFAULT_SERVICES, params],
    queryFn: () => getDefaultServicesApi(params),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useCreateDefaultService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDefaultServiceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_DEFAULT_SERVICES] });
      message.success("Service créé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la création");
    },
  });
};

export const useUpdateDefaultService = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDefaultServiceApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_DEFAULT_SERVICES] });
      message.success("Service mis à jour avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la mise à jour");
    },
  });
};

export const useApplyDefaultServices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applyDefaultServicesApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SALON_SERVICES] });
      message.success("Services par défaut appliqués avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de l'application");
    },
  });
};

// ============================================================================
// REVIEWS HOOKS
// ============================================================================

export const useGetReviews = (params?: {
  salonId?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: [GET_REVIEWS, params],
    queryFn: () => getReviewsApi(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetReview = (id: string) => {
  return useQuery({
    queryKey: [GET_REVIEW, id],
    queryFn: () => getReviewApi(id),
    enabled: !!id,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReviewApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_REVIEWS] });
      message.success("Avis créé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la création");
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReviewApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_REVIEWS] });
      queryClient.invalidateQueries({ queryKey: [GET_REVIEW, variables.id] });
      message.success("Avis mis à jour avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la mise à jour");
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReviewApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_REVIEWS] });
      message.success("Avis supprimé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la suppression");
    },
  });
};

export const useReportReview = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      reportReviewApi(id, data),
    onSuccess: () => {
      message.success("Avis signalé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors du signalement");
    },
  });
};

// ============================================================================
// RATINGS HOOKS
// ============================================================================

export const useCreateRating = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRatingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_RATINGS] });
      message.success("Note créée avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la création");
    },
  });
};

export const useGetSalonRatings = (salonId: string) => {
  return useQuery({
    queryKey: [GET_RATINGS, salonId],
    queryFn: () => getSalonRatingsApi(salonId),
    enabled: !!salonId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetSalonRatingStats = (salonId: string) => {
  return useQuery({
    queryKey: [GET_SALON_RATING_STATS, salonId],
    queryFn: () => getSalonRatingStatsApi(salonId),
    enabled: !!salonId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ============================================================================
// PHOTOS HOOKS
// ============================================================================

export const useUploadSalonPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ salonId, file }: { salonId: string; file: File }) =>
      uploadSalonPhotoApi(salonId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [GET_SALON_PHOTOS, variables.salonId],
      });
      queryClient.invalidateQueries({
        queryKey: [GET_SALON, variables.salonId],
      });
      message.success("Photo uploadée avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de l'upload");
    },
  });
};

export const useUploadServicePhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, file }: { serviceId: string; file: File }) =>
      uploadServicePhotoApi(serviceId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SALON_SERVICES] });
      message.success("Photo uploadée avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de l'upload");
    },
  });
};

export const useGetSalonPhotos = (salonId: string) => {
  return useQuery({
    queryKey: [GET_SALON_PHOTOS, salonId],
    queryFn: () => getSalonPhotosApi(salonId),
    enabled: !!salonId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDeleteSalonPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSalonPhotoApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SALON_PHOTOS] });
      message.success("Photo supprimée avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la suppression");
    },
  });
};

// ============================================================================
// STATS HOOKS
// ============================================================================

export const useGetAdminStats = () => {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStatsApi,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
};

export const useGetSalonDashboardStats = (salonId: string) => {
  return useQuery({
    queryKey: [GET_SALON_DASHBOARD_STATS, salonId],
    queryFn: () => getSalonDashboardStatsApi(salonId),
    enabled: !!salonId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useGetSalonMonthlyRevenue = (
  salonId: string,
  params?: { year?: number; month?: number }
) => {
  return useQuery({
    queryKey: [GET_SALON_DASHBOARD_STATS, salonId, "revenue", params],
    queryFn: () => getSalonMonthlyRevenueApi(salonId, params),
    enabled: !!salonId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ============================================================================
// CANCELLATIONS HOOKS
// ============================================================================

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, data }: { bookingId: string; data: any }) =>
      cancelBookingApi(bookingId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_BOOKINGS] });
      queryClient.invalidateQueries({
        queryKey: [GET_BOOKING, variables.bookingId],
      });
      message.success("Réservation annulée avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de l'annulation");
    },
  });
};

export const useMarkBookingAsNoShow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markBookingAsNoShowApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_BOOKINGS] });
      message.success("Réservation marquée comme no-show !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors du marquage");
    },
  });
};

// ============================================================================
// SALON HOLIDAYS HOOKS
// ============================================================================

export const useGetSalonHolidays = (salonId: string) => {
  return useQuery({
    queryKey: [GET_SALON_HOLIDAYS, salonId],
    queryFn: () => getSalonHolidaysApi(salonId),
    enabled: !!salonId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCreateSalonHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSalonHolidayApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SALON_HOLIDAYS] });
      message.success("Vacance créée avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la création");
    },
  });
};

export const useUpdateSalonHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSalonHolidayApi,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [GET_SALON_HOLIDAYS] });
      queryClient.invalidateQueries({
        queryKey: [GET_SALON_HOLIDAYS, variables.id],
      });
      message.success("Vacance mise à jour avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la mise à jour");
    },
  });
};

export const useDeleteSalonHoliday = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSalonHolidayApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_SALON_HOLIDAYS] });
      message.success("Vacance supprimée avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la suppression");
    },
  });
};

// ============================================================================
// PAYOUTS HOOKS
// ============================================================================

export const useGetBookingPayout = (bookingId: string) => {
  return useQuery({
    queryKey: [GET_PAYOUTS, "booking", bookingId],
    queryFn: () => getBookingPayoutApi(bookingId),
    enabled: !!bookingId,
  });
};

export const useProcessBookingPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: processBookingPayoutApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_PAYOUTS] });
      message.success("Paiement traité avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors du traitement");
    },
  });
};

export const useGetSalonPendingPayouts = (salonId: string) => {
  return useQuery({
    queryKey: [GET_PAYOUTS, "salon", salonId, "pending"],
    queryFn: () => getSalonPendingPayoutsApi(salonId),
    enabled: !!salonId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// ============================================================================
// PLATFORM CONFIG HOOKS
// ============================================================================

export const useGetPlatformConfig = () => {
  return useQuery({
    queryKey: [GET_PLATFORM_CONFIG],
    queryFn: getPlatformConfigApi,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useUpdatePlatformConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePlatformConfigApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_PLATFORM_CONFIG] });
      message.success("Configuration mise à jour avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la mise à jour");
    },
  });
};

// ============================================================================
// STRIPE CONNECT HOOKS
// ============================================================================

export const useCreateStripeConnectAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStripeConnectAccountApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GET_MY_SALON] });
      message.success("Compte Stripe Connect créé avec succès !");
    },
    onError: (error: any) => {
      message.error(error?.message || "Erreur lors de la création");
    },
  });
};

export const useGetStripeConnectAccountStatus = (accountId: string) => {
  return useQuery({
    queryKey: ["stripe-connect", accountId],
    queryFn: () => getStripeConnectAccountStatusApi(accountId),
    enabled: !!accountId,
  });
};

// ============================================================================
// SALON TYPES HOOKS
// ============================================================================

export const useGetSalonTypes = () => {
  return useQuery({
    queryKey: [GET_SALON_TYPES],
    queryFn: getSalonTypesApi,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours (rarely changes)
  });
};
