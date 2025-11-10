/* eslint-disable @typescript-eslint/no-explicit-any */
import { handleError, requestWrapper } from "../../config/requestsConfig";

// ============================================================================
// AUTHENTICATION
// ============================================================================

export const loginApi = async (data: { email: string; password: string }) => {
  try {
    const response = await requestWrapper.post("/auth/login", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la connexion");
    return null;
  }
};

export const registerApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/auth/register", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de l'inscription");
    return null;
  }
};

export const registerSalonApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/auth/register-salon", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de l'inscription du salon");
    return null;
  }
};

export const forgotPasswordApi = async (email: string) => {
  try {
    const response = await requestWrapper.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de l'envoi de l'email");
    return null;
  }
};

export const resetPasswordApi = async ({
  token,
  password,
}: {
  token: string;
  password: string;
}) => {
  try {
    const response = await requestWrapper.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la réinitialisation");
    return null;
  }
};

export const verifyEmailApi = async (token: string) => {
  try {
    const response = await requestWrapper.get(`/user/token/${token}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la vérification de l'email");
    return null;
  }
};

export const getUsersbyTokenApi = async (token: string) => {
  try {
    const response = await requestWrapper.get(`/user/token/${token}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération de l'utilisateur");
    return null;
  }
};

export const getMeApi = async () => {
  try {
    const response = await requestWrapper.get("/auth/me");
    return response.data;
  } catch (error: any) {
    // ✅ Ne pas appeler handleError ici car il lance une exception
    // On veut juste logger et retourner null pour que le hook puisse gérer l'erreur
    console.error("❌ Erreur getMeApi:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      },
    });
    
    // Si c'est une erreur 401, ne pas logger comme erreur critique
    if (error.response?.status === 401) {
      console.warn("⚠️ Non authentifié - redirection vers login nécessaire");
    }
    
    // Retourner null pour que React Query puisse gérer l'erreur
    return null;
  }
};

// ============================================================================
// USERS
// ============================================================================

export const getUsersApi = async () => {
  try {
    const response = await requestWrapper.get("/user");
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des utilisateurs");
    return null;
  }
};

export const getUserApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/user/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération de l'utilisateur");
    return null;
  }
};

export const createUserApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/user", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création de l'utilisateur");
    return null;
  }
};

export const updateUserApi = async (data: { id: string; data: any }) => {
  try {
    const response = await requestWrapper.put(`/user/${data.id}`, data.data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour de l'utilisateur");
    return null;
  }
};

export const updateUserProfileApi = async (data: any) => {
  try {
    const response = await requestWrapper.put("/user/profile", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour du profil");
    return null;
  }
};

export const deleteUserApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/user/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la suppression de l'utilisateur");
    return null;
  }
};

export const bulkDeleteUsersApi = async (userIds: string[]) => {
  try {
    const response = await requestWrapper.post("/user/bulk-delete", {
      userIds,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la suppression en masse");
    return null;
  }
};

export const getUserStatsApi = async () => {
  try {
    const response = await requestWrapper.get("/user/stats");
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des statistiques");
    return null;
  }
};

export const getUserPreferencesApi = async () => {
  try {
    const response = await requestWrapper.get("/user/preferences");
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des préférences");
    return null;
  }
};

export const updateUserPreferencesApi = async (data: any) => {
  try {
    const response = await requestWrapper.put("/user/preferences", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour des préférences");
    return null;
  }
};

export const contactApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/user/contact", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de l'envoi du message");
    return null;
  }
};

// ============================================================================
// SALONS
// ============================================================================

export const getSalonsApi = async (params?: {
  limit?: number;
  offset?: number;
  salonType?: string;
  city?: string;
  search?: string;
}) => {
  try {
    const response = await requestWrapper.get("/salons", { params });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des salons");
    return null;
  }
};

export const getSalonApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/salons/${id}/detail`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération du salon");
    return null;
  }
};

export const createSalonApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/salons", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création du salon");
    return null;
  }
};

export const updateSalonApi = async (data: { id: string; data: any }) => {
  try {
    const response = await requestWrapper.put(`/salons/${data.id}`, data.data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour du salon");
    return null;
  }
};

export const deleteSalonApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/salons/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la suppression du salon");
    return null;
  }
};

export const getMySalonApi = async () => {
  try {
    const response = await requestWrapper.get("/salons/my-salon");
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération de mon salon");
    return null;
  }
};

export const getSalonServicesApi = async (salonId: string) => {
  try {
    const response = await requestWrapper.get(`/salons/${salonId}/services`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des services");
    return null;
  }
};

export const getSalonReviewsApi = async (salonId: string) => {
  try {
    const response = await requestWrapper.get(`/salons/${salonId}/reviews`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des avis");
    return null;
  }
};

export const getSalonStatsApi = async (salonId: string) => {
  try {
    const response = await requestWrapper.get(`/salons/${salonId}/stats`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des statistiques");
    return null;
  }
};

export const searchSalonsApi = async (params: {
  query?: string;
  salonType?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
  offset?: number;
}) => {
  try {
    const response = await requestWrapper.get("/salons/search", { params });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la recherche de salons");
    return null;
  }
};

export const getNearestSalonsApi = async (params: {
  latitude: number;
  longitude: number;
  radius?: number;
  limit?: number;
}) => {
  try {
    const response = await requestWrapper.get("/salons/nearest", { params });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des salons proches");
    return null;
  }
};

// ============================================================================
// SALON AVAILABILITY
// ============================================================================

export const getSalonAvailabilityApi = async (
  salonId: string,
  date: string
) => {
  try {
    const response = await requestWrapper.get(
      `/salons/${salonId}/availability`,
      {
        params: { date },
      }
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des disponibilités");
    return null;
  }
};

export const getSalonBookingAvailabilityApi = async (
  salonId: string,
  date: string,
  duration: number
) => {
  try {
    const response = await requestWrapper.get(
      `/salons/${salonId}/booking-availability`,
      {
        params: { date, duration },
      }
    );
    return response.data;
  } catch (error) {
    handleError(
      error,
      "Erreur lors de la récupération des disponibilités de réservation"
    );
    return null;
  }
};

export const getSalonAvailabilityRangeApi = async (
  salonId: string,
  startDate: string,
  endDate: string
) => {
  try {
    const response = await requestWrapper.get(
      `/salons/${salonId}/availability/range`,
      {
        params: { startDate, endDate },
      }
    );
    return response.data;
  } catch (error) {
    handleError(
      error,
      "Erreur lors de la récupération de la plage de disponibilités"
    );
    return null;
  }
};

// ============================================================================
// BOOKINGS
// ============================================================================

export const getBookingsApi = async (params?: {
  status?: string;
  clientId?: string;
  salonId?: string;
  isHomeService?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    const response = await requestWrapper.get("/bookings", { params });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des réservations");
    return null;
  }
};

export const getBookingApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération de la réservation");
    return null;
  }
};

export const createBookingApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/bookings", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création de la réservation");
    return null;
  }
};

export const updateBookingApi = async (data: { id: string; data: any }) => {
  try {
    const response = await requestWrapper.put(`/bookings/${data.id}`, data.data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour de la réservation");
    return null;
  }
};

export const getClientBookingsApi = async (
  clientId: string,
  params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }
) => {
  try {
    const response = await requestWrapper.get(`/bookings/client/${clientId}`, {
      params,
    });
    return response.data;
  } catch (error) {
    handleError(
      error,
      "Erreur lors de la récupération des réservations du client"
    );
    return null;
  }
};

export const getSalonBookingsApi = async (
  salonId: string,
  params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }
) => {
  try {
    const response = await requestWrapper.get(`/bookings/salon/${salonId}`, {
      params,
    });
    return response.data;
  } catch (error) {
    handleError(
      error,
      "Erreur lors de la récupération des réservations du salon"
    );
    return null;
  }
};

// ============================================================================
// PAYMENTS
// ============================================================================

export const getStripeConfigApi = async () => {
  try {
    const response = await requestWrapper.get("/payments/stripe-config");
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération de la config Stripe");
    return null;
  }
};

export const createCheckoutSessionApi = async (data: any) => {
  try {
    const response = await requestWrapper.post(
      "/payments/create-checkout-session",
      data
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création de la session de paiement");
    return null;
  }
};

export const getCheckoutSessionApi = async (sessionId: string) => {
  try {
    const response = await requestWrapper.get(
      `/payments/session/${sessionId}`
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération de la session");
    return null;
  }
};

export const createPaymentIntentApi = async (data: any) => {
  try {
    const response = await requestWrapper.post(
      "/payments/create-payment-intent",
      data
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création du PaymentIntent");
    return null;
  }
};

export const confirmPaymentApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/payments/confirm-payment", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la confirmation du paiement");
    return null;
  }
};

export const calculateTaxesApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/payments/calculate-taxes", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors du calcul des taxes");
    return null;
  }
};

// ============================================================================
// SALON SERVICES
// ============================================================================

export const getSalonServicesListApi = async (params?: {
  salonId?: string;
  categoryId?: string;
  isActive?: boolean;
}) => {
  try {
    const response = await requestWrapper.get("/salon-services", { params });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des services");
    return null;
  }
};

export const getSalonServiceApi = async (serviceId: string) => {
  try {
    const response = await requestWrapper.get(`/salon-services/${serviceId}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération du service");
    return null;
  }
};

export const createSalonServiceApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/salon-services", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création du service");
    return null;
  }
};

export const updateSalonServiceApi = async (data: {
  serviceId: string;
  data: any;
}) => {
  try {
    const response = await requestWrapper.patch(
      `/salon-services/${data.serviceId}`,
      data.data
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour du service");
    return null;
  }
};

export const reactivateSalonServiceApi = async (serviceId: string) => {
  try {
    const response = await requestWrapper.patch(
      `/salon-services/${serviceId}/reactivate`
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la réactivation du service");
    return null;
  }
};

export const deleteSalonServiceApi = async (serviceId: string) => {
  try {
    const response = await requestWrapper.delete(
      `/salon-services/${serviceId}`
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la suppression du service");
    return null;
  }
};

// ============================================================================
// SERVICE OPTIONS
// ============================================================================

export const getServiceOptionsApi = async (params?: {
  serviceId?: string;
  salonId?: string;
  optionType?: string;
}) => {
  try {
    const response = await requestWrapper.get("/service-options", { params });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des options");
    return null;
  }
};

export const getServiceOptionApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/service-options/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération de l'option");
    return null;
  }
};

export const createServiceOptionApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/service-options", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création de l'option");
    return null;
  }
};

export const updateServiceOptionApi = async (data: { id: string; data: any }) => {
  try {
    const response = await requestWrapper.put(
      `/service-options/${data.id}`,
      data.data
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour de l'option");
    return null;
  }
};

export const deleteServiceOptionApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/service-options/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la suppression de l'option");
    return null;
  }
};

export const bulkCreateServiceOptionsApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/service-options/bulk", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création en masse des options");
    return null;
  }
};

// ============================================================================
// SERVICE CATEGORIES
// ============================================================================

export const getServiceCategoriesApi = async () => {
  try {
    const response = await requestWrapper.get("/service-categories");
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des catégories");
    return null;
  }
};

export const updateServiceCategoryApi = async (data: {
  id: string;
  updates: {
    name?: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
  };
}) => {
  try {
    const response = await requestWrapper.put(
      `/service-categories/${data.id}`,
      data.updates
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour de la catégorie");
    return null;
  }
};

// ============================================================================
// DEFAULT SERVICES
// ============================================================================

export const getDefaultServicesApi = async (params?: {
  salonType?: string;
  categoryId?: string;
  group?: string;
}) => {
  try {
    const response = await requestWrapper.get("/default-services", { params });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des services par défaut");
    return null;
  }
};

export const applyDefaultServicesApi = async (salonId: string) => {
  try {
    const response = await requestWrapper.post(
      `/default-services/apply/${salonId}`
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de l'application des services par défaut");
    return null;
  }
};

export const createDefaultServiceApi = async (data: {
  name: string;
  description?: string;
  duration: number;
  categoryId: string;
  salonType: string;
  group: string;
  hasThicknessOptions?: boolean;
  requiresExtensions?: boolean;
  availableLocations?: string[];
  isActive?: boolean;
}) => {
  try {
    const response = await requestWrapper.post("/default-services", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création du service");
    return null;
  }
};

export const updateDefaultServiceApi = async (data: {
  id: string;
  updates: {
    name?: string;
    description?: string;
    duration?: number;
    isActive?: boolean;
    categoryId?: string;
    salonType?: string;
    group?: string;
    hasThicknessOptions?: boolean;
    requiresExtensions?: boolean;
    availableLocations?: string[];
  };
}) => {
  try {
    const response = await requestWrapper.put(
      `/default-services/${data.id}`,
      data.updates
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour du service");
    return null;
  }
};

// ============================================================================
// REVIEWS
// ============================================================================

export const getReviewsApi = async (params?: {
  salonId?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}) => {
  try {
    const response = await requestWrapper.get("/reviews", { params });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des avis");
    return null;
  }
};

export const getReviewApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/reviews/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération de l'avis");
    return null;
  }
};

export const createReviewApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/reviews", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création de l'avis");
    return null;
  }
};

export const updateReviewApi = async (data: { id: string; data: any }) => {
  try {
    const response = await requestWrapper.put(`/reviews/${data.id}`, data.data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour de l'avis");
    return null;
  }
};

export const deleteReviewApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/reviews/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la suppression de l'avis");
    return null;
  }
};

export const reportReviewApi = async (id: string, data: any) => {
  try {
    const response = await requestWrapper.post(`/reviews/${id}/report`, data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors du signalement de l'avis");
    return null;
  }
};

// ============================================================================
// RATINGS
// ============================================================================

export const createRatingApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/ratings", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création de la note");
    return null;
  }
};

export const getSalonRatingsApi = async (salonId: string) => {
  try {
    const response = await requestWrapper.get(`/ratings/salon/${salonId}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des notes");
    return null;
  }
};

export const getSalonRatingStatsApi = async (salonId: string) => {
  try {
    const response = await requestWrapper.get(`/ratings/salon/${salonId}/stats`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des statistiques de notes");
    return null;
  }
};

// ============================================================================
// PHOTOS
// ============================================================================

export const uploadSalonPhotoApi = async (salonId: string, file: File) => {
  const formData = new FormData();
  formData.append("photo", file);

  try {
    const response = await requestWrapper.post(
      `/photos/salon/${salonId}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de l'upload de la photo");
    return null;
  }
};

export const uploadServicePhotoApi = async (serviceId: string, file: File) => {
  const formData = new FormData();
  formData.append("photo", file);

  try {
    const response = await requestWrapper.post(
      `/photos/service/${serviceId}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de l'upload de la photo");
    return null;
  }
};

export const getSalonPhotosApi = async (salonId: string) => {
  try {
    const response = await requestWrapper.get(`/photos/salon/${salonId}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des photos");
    return null;
  }
};

export const deleteSalonPhotoApi = async (photoId: string) => {
  try {
    const response = await requestWrapper.delete(`/photos/salon/${photoId}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la suppression de la photo");
    return null;
  }
};

// ============================================================================
// STATS
// ============================================================================

export const getAdminStatsApi = async () => {
  try {
    const response = await requestWrapper.get("/stats/admin");
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des statistiques admin");
    return null;
  }
};

export const getSalonDashboardStatsApi = async (salonId: string) => {
  try {
    const response = await requestWrapper.get(
      `/stats/salon/${salonId}/dashboard`
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des statistiques");
    return null;
  }
};

export const getSalonMonthlyRevenueApi = async (
  salonId: string,
  params?: { year?: number; month?: number }
) => {
  try {
    const response = await requestWrapper.get(
      `/stats/salon/${salonId}/monthly-revenue`,
      { params }
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération du revenu mensuel");
    return null;
  }
};

// ============================================================================
// CANCELLATIONS
// ============================================================================

export const cancelBookingApi = async (bookingId: string, data: any) => {
  try {
    const response = await requestWrapper.post(
      `/cancellations/${bookingId}/cancel`,
      data
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de l'annulation");
    return null;
  }
};

export const markBookingAsNoShowApi = async (bookingId: string) => {
  try {
    const response = await requestWrapper.post(
      `/cancellations/${bookingId}/no-show`
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors du marquage comme no-show");
    return null;
  }
};

// ============================================================================
// SALON HOLIDAYS
// ============================================================================

export const getSalonHolidaysApi = async (salonId: string) => {
  try {
    const response = await requestWrapper.get(
      `/salon-holidays/salon/${salonId}`
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des vacances");
    return null;
  }
};

export const createSalonHolidayApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/salon-holidays", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création de la vacance");
    return null;
  }
};

export const updateSalonHolidayApi = async (data: { id: string; data: any }) => {
  try {
    const response = await requestWrapper.put(
      `/salon-holidays/${data.id}`,
      data.data
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour de la vacance");
    return null;
  }
};

export const deleteSalonHolidayApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/salon-holidays/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la suppression de la vacance");
    return null;
  }
};

// ============================================================================
// PAYOUTS
// ============================================================================

export const getBookingPayoutApi = async (bookingId: string) => {
  try {
    const response = await requestWrapper.get(`/payouts/booking/${bookingId}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération du paiement");
    return null;
  }
};

export const processBookingPayoutApi = async (bookingId: string) => {
  try {
    const response = await requestWrapper.post(
      `/payouts/booking/${bookingId}/process`
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors du traitement du paiement");
    return null;
  }
};

export const getSalonPendingPayoutsApi = async (salonId: string) => {
  try {
    const response = await requestWrapper.get(
      `/payouts/salon/${salonId}/pending`
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des paiements en attente");
    return null;
  }
};

// ============================================================================
// PLATFORM CONFIG
// ============================================================================

export const getPlatformConfigApi = async () => {
  try {
    const response = await requestWrapper.get("/platform-config");
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération de la configuration");
    return null;
  }
};

export const updatePlatformConfigApi = async (data: { id: string; data: any }) => {
  try {
    const response = await requestWrapper.put(
      `/platform-config/${data.id}`,
      data.data
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour de la configuration");
    return null;
  }
};

// ============================================================================
// STRIPE CONNECT
// ============================================================================

export const createStripeConnectAccountApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/stripe-connect/accounts", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création du compte Stripe Connect");
    return null;
  }
};

export const getStripeConnectAccountStatusApi = async (accountId: string) => {
  try {
    const response = await requestWrapper.get(
      `/stripe-connect/accounts/${accountId}/status`
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération du statut");
    return null;
  }
};

// ============================================================================
// SALON TYPES
// ============================================================================

export const getSalonTypesApi = async () => {
  try {
    const response = await requestWrapper.get("/salon-types");
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des types de salon");
    return null;
  }
};
