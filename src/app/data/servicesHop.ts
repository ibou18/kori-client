import { buildQueryParams } from "@/utils/buildQueryParams";
import { handleError, requestWrapper } from "../../config/requestsConfig";
import { IPlan, IInvoice } from "../interface";
import {
  IDelivery,
  IDeliveryResponse,
  InvoiceStatus,
  ITrip,
  PackageCreateData,
  PackageFilters,
  PackageStatus,
  PackageUpdateData,
  TripCreateData,
  TripFilters,
  TripStatus,
  TripUpdateData,
} from "../interfaceHop";

export const uploadLogoApi = async (companyId: string, file: File) => {
  const formData = new FormData();
  formData.append("logo", file);

  const response = await requestWrapper.post(
    `/companies/${companyId}/logo`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const getStripeConnectLoginLinkApi = async () => {
  try {
    const response = await requestWrapper.get("/stripe/connect/login-link");
    return response.data;
  } catch (error) {
    handleError(
      error,
      "Erreur lors de la génération du lien de connexion Stripe Connect"
    );
    return null;
  }
};

export const getVerifyEmail = async (token: string) => {
  try {
    const response = await requestWrapper.get(`/auth/verify-email/${token}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error Verifiy  Email session");
    return null;
  }
};
export const getPayementSessionApi = async (sessionId: string) => {
  try {
    const response = await requestWrapper.get(`/stripe/session/${sessionId}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching payment session");
    return null;
  }
};

export const sendMailSupportApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/users/send-mail", data);
    return response.data;
  } catch (error) {
    handleError(error, "Error creating user");
    return null;
  }
};

export const createUserApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/users", data);
    return response.data;
  } catch (error) {
    handleError(error, "Error creating user");
    return null;
  }
};

export const inviteUserApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/users/invite", data);
    return response.data;
  } catch (error) {
    handleError(error, "Error creating user");
    return null;
  }
};

export const registerApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/auth/register", data);
    return response.data;
  } catch (error) {
    handleError(error, "Error creating user");
    return null;
  }
};

export const getUsersApi = async () => {
  try {
    const response = await requestWrapper.get("/users");
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching users");

    return null;
  }
};

export const getUserApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching user");
    return null;
  }
};

export const getUserByTokenApi = async (token: string) => {
  try {
    const response = await requestWrapper.get(`/users/token/${token}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching user");
    return null;
  }
};

export const deleteUserApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error deleting user");
    return null;
  }
};

export const updateUserApi = async (data: any) => {
  console.log("data", data);
  try {
    const response = await requestWrapper.put(`/users/${data.id}`, data.data);
    return response.data;
  } catch (error) {
    handleError(error, "Error updating user");
    return null;
  }
};

//_____ Delivery service __________

export const createDeliveryApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/delivery-registration", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création de la livraison");
    return null;
  }
};

export const getDeliveriesApi = async (filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    // Construction des paramètres de requête
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await requestWrapper.get(`/deliveries${queryString}`);

    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des livraisons");
    return null;
  }
};

export const getAvailableDeliveriesApi = async (filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  startCity?: string;
  endCity?: string;
  page?: number;
  limit?: number;
  owned?: string;
}) => {
  try {
    // Construction des paramètres de requête
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.startCity) params.append("startCity", filters.startCity);
    if (filters?.endCity) params.append("endCity", filters.endCity);
    if (filters?.owned) params.append("owned", filters.owned);

    const queryString = params.toString() ? `?${params.toString()}` : "";

    // console.log("queryString", queryString);
    const response = await requestWrapper.get(
      `/deliveries/available${queryString}`
    );

    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des livraisons");
    return null;
  }
};

export const getAllDeliveriesByUserApi = async (filters?: {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    // Construction des paramètres de requête
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await requestWrapper.get(`/deliveries/user${queryString}`);

    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des livraisons");
    return null;
  }
};

export const getDeliveryByIdApi = async (id: string | undefined) => {
  try {
    const response = await requestWrapper.get(`/deliveries/${id}`);
    return response.data as IDeliveryResponse;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération de la livraison");
    return null;
  }
};

export const updateDeliveryApi = async (id: string, data: any) => {
  try {
    const response = await requestWrapper.put(`/deliveries/${id}`, data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour de la livraison");
    return null;
  }
};

export const updateDeliveryStatusApi = async (id: string, status: string) => {
  try {
    const response = await requestWrapper.put(`/deliveries/${id}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour du statut de livraison");
    return null;
  }
};

export const deleteDeliveryApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/deliveries/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la suppression de la livraison");
    return null;
  }
};

export const getDeliveryStatsApi = async (
  period?: "day" | "week" | "month" | "year"
) => {
  try {
    const queryString = period ? `?period=${period}` : "";
    const response = await requestWrapper.get(
      `/deliveries/stats${queryString}`
    );
    return response.data;
  } catch (error) {
    handleError(
      error,
      "Erreur lors de la récupération des statistiques de livraison"
    );
    return null;
  }
};

export const getDeliveryByTrackingNumberApi = async (
  trackingNumber: string
) => {
  try {
    const response = await requestWrapper.get(
      `/deliveries/tracking/${trackingNumber}`
    );
    return response.data;
  } catch (error) {
    handleError(
      error,
      "Erreur lors de la recherche de la livraison par numéro de suivi"
    );
    return null;
  }
};

export const getUserDeliveryHistoryApi = async (filters?: {
  role?: "sender" | "receiver" | "traveler";
  status?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    // Construction des paramètres de requête
    const params = new URLSearchParams();

    if (filters?.role) params.append("role", filters.role);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await requestWrapper.get(
      `/deliveries/history${queryString}`
    );

    return response.data;
  } catch (error) {
    handleError(
      error,
      "Erreur lors de la récupération de l'historique des livraisons"
    );
    return null;
  }
};

// services

interface InvoiceCreateData {
  userId: string;
  deliveryId: string;
  amount: number;
  platformFee: number;
  taxAmount: number;
  totalAmount: number;
  dueDate: string;
}

interface InvoiceUpdateData {
  status?: InvoiceStatus;
  amount?: number;
  platformFee?: number;
  taxAmount?: number;
  totalAmount?: number;
  dueDate?: string;
  paymentDate?: string;
}

export const createInvoiceApi = async (data: InvoiceCreateData) => {
  try {
    const response = await requestWrapper.post("/invoices", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création de la facture");
    return null;
  }
};

export const getInvoicesApi = async (filters?: {
  status?: InvoiceStatus;
  userId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}) => {
  try {
    const queryString = buildQueryParams(filters || {});
    const response = await requestWrapper.get(`/invoices${queryString}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des factures");
    return null;
  }
};

export const getInvoiceByIdApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/invoices/${id}`);
    return response.data as IInvoice;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération de la facture");
    return null;
  }
};

export const updateInvoiceApi = async (id: string, data: InvoiceUpdateData) => {
  try {
    const response = await requestWrapper.put(`/invoices/${id}`, data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour de la facture");
    return null;
  }
};

export const updateInvoiceStatusApi = async (
  id: string,
  status: InvoiceStatus
) => {
  try {
    const response = await requestWrapper.put(`/invoices/${id}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour du statut de la facture");
    return null;
  }
};

export const deleteInvoiceApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/invoices/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la suppression de la facture");
    return null;
  }
};

export const getInvoiceStatsApi = async (
  filters?:
    | {
        status?: InvoiceStatus;
        userId?: string;
        startDate?: string;
        endDate?: string;
        minAmount?: number;
        maxAmount?: number;
        page?: number;
        limit?: number;
      }
    | undefined
) => {
  try {
    const response = await requestWrapper.get("/invoices/stats/basic");
    return response.data;
  } catch (error) {
    handleError(
      error,
      "Erreur lors de la récupération des statistiques de factures"
    );
    return null;
  }
};

export const getDetailedInvoiceStatsApi = async (
  period?: "day" | "week" | "month" | "year"
) => {
  try {
    const queryString = period ? `?period=${period}` : "";
    const response = await requestWrapper.get(
      `/invoices/stats/detailed${queryString}`
    );
    return response.data;
  } catch (error) {
    handleError(
      error,
      "Erreur lors de la récupération des statistiques détaillées"
    );
    return null;
  }
};

export const markOverdueInvoicesApi = async () => {
  try {
    const response = await requestWrapper.post("/invoices/mark-overdue");
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors du marquage des factures en retard");
    return null;
  }
};

export const sendInvoiceByEmailApi = async (id: string) => {
  try {
    const response = await requestWrapper.post(`/invoices/${id}/send-email`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de l'envoi de la facture par email");
    return null;
  }
};

// _______ Trip ___________
export const createTripApi = async (data: TripCreateData) => {
  try {
    const response = await requestWrapper.post("/trips", {
      ...data,
      startTime:
        data.startTime instanceof Date
          ? data.startTime.toISOString()
          : data.startTime,
      endTime:
        data.endTime instanceof Date
          ? data.endTime.toISOString()
          : data.endTime,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création du voyage");
    return null;
  }
};

export const getTripsApi = async (filters?: TripFilters) => {
  try {
    const queryString = buildQueryParams(filters || {});
    const response = await requestWrapper.get(`/trips${queryString}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des voyages");
    return null;
  }
};

export const getTripByIdApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/trips/${id}`);
    return response.data as ITrip;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération du voyage");
    return null;
  }
};

export const updateTripApi = async (id: string, data: TripUpdateData) => {
  try {
    // Conversion des dates pour l'API
    const formattedData = {
      ...data,
      startTime:
        data.startTime instanceof Date
          ? data.startTime.toISOString()
          : data.startTime,
      endTime:
        data.endTime instanceof Date
          ? data.endTime.toISOString()
          : data.endTime,
    };

    const response = await requestWrapper.put(`/trips/${id}`, formattedData);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour du voyage");
    return null;
  }
};

export const updateTripStatusApi = async (data: any) => {
  try {
    const response = await requestWrapper.put(`/trips/${data.tripId}/status`, {
      status: data.status,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour du statut du voyage");
    return null;
  }
};

export const deleteTripApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/trips/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la suppression du voyage");
    return null;
  }
};

export const searchTripsApi = async (filters?: {
  startLocation?: string;
  endLocation?: string;
  startDate?: string;
  endDate?: string;
  minSpace?: number;
  page?: number;
  limit?: number;
}) => {
  try {
    const queryString = buildQueryParams(filters || {});
    const response = await requestWrapper.get(`/trips/search${queryString}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la recherche de voyages disponibles");
    return null;
  }
};

export const getTripStatsApi = async () => {
  try {
    const response = await requestWrapper.get("/trips/stats");
    return response.data;
  } catch (error) {
    handleError(
      error,
      "Erreur lors de la récupération des statistiques de voyage"
    );
    return null;
  }
};

// _______ Package ___________
export const createPackageApi = async (data: PackageCreateData) => {
  try {
    const response = await requestWrapper.post("/packages", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création du colis");
    return null;
  }
};

export const getPackagesApi = async (filters?: PackageFilters) => {
  try {
    const queryString = buildQueryParams(filters || {});
    const response = await requestWrapper.get(`/packages${queryString}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des colis");
    return null;
  }
};

export const getPackageByIdApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/packages/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération du colis");
    return null;
  }
};

export const getPackagesByDeliveryIdApi = async (deliveryId: string) => {
  try {
    const response = await requestWrapper.get(
      `/packages/delivery/${deliveryId}`
    );
    return response.data;
  } catch (error) {
    handleError(
      error,
      "Erreur lors de la récupération des colis de la livraison"
    );
    return null;
  }
};

export const updatePackageApi = async (id: string, data: PackageUpdateData) => {
  try {
    const response = await requestWrapper.put(`/packages/${id}`, data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour du colis");
    return null;
  }
};

export const updatePackageStatusApi = async (
  id: string,
  status: PackageStatus
) => {
  try {
    const response = await requestWrapper.put(`/packages/${id}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la mise à jour du statut du colis");
    return null;
  }
};

export const deletePackageApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/packages/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la suppression du colis");
    return error;
  }
};

export const scanPackageApi = async (id: string, location?: string) => {
  try {
    const response = await requestWrapper.post(`/packages/${id}/scan`, {
      location,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors du scan du colis");
    return null;
  }
};

export const scanDeliveryQrcode = async (trackingNumber: string) => {
  try {
    const response = await requestWrapper.get(
      `/deliveries/tracking/${trackingNumber}`
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors du scan du colis");
    return null;
  }
};

export const acceptDeliveryApi = async (data: any) => {
  console.log("data", data);
  try {
    const response = await requestWrapper.put(
      `/deliveries/${data.deliveryId}/accept`,
      data
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de l'acceptation de la livraison");
    return null;
  }
};

export const createCheckoutSessionApi = async (data: any) => {
  try {
    const response = await requestWrapper.post(
      "/stripe/create-checkout-session",
      data
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création de la session de paiement");
    return null;
  }
};

export const getTransfers = async () => {
  try {
    const response = await requestWrapper.get("/stripe/transfers");
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création de la session de paiement");
    return null;
  }
};

export const getReceiversApi = async () => {
  try {
    const response = await requestWrapper.get("/receivers");
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création de la session de paiement");
    return null;
  }
};

export const createReceiverApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/receivers", data);
    return response.data;
  } catch (error) {
    handleError(error, "Error creating user");
    return null;
  }
};

// Service pour créer une livraison (sans colis)
export const createDeliveryWithoutPackagesApi = async (deliveryData: any) => {
  try {
    const response = await requestWrapper.post(
      "/delivery-registration/delivery",
      deliveryData
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création de la livraison");
    return null;
  }
};

// Service pour ajouter un colis simple à une livraison existante
export const addPackageToDeliveryApi = async (
  deliveryId: string,
  packageData: any
) => {
  try {
    const response = await requestWrapper.post(
      `/delivery/${deliveryId}/package`,
      packageData
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de l'ajout du colis à la livraison");
    return null;
  }
};

// Service pour ajouter un colis avec images à une livraison existante
export const addPackageWithImagesToDeliveryApi = async (
  deliveryId: string,
  packageData: any,
  imageFiles: File[]
) => {
  try {
    // Création d'un FormData pour l'envoi de fichiers
    const formData = new FormData();

    // Ajout des données du package (converties en JSON)
    formData.append("packageData", JSON.stringify(packageData));

    // Ajout des images
    imageFiles.forEach((file, index) => {
      formData.append("images", file);
    });

    // Ajout des titres d'images si nécessaire
    if (packageData.imageTitles && packageData.imageTitles.length) {
      formData.append("titles", JSON.stringify(packageData.imageTitles));
    }

    const response = await requestWrapper.post(
      `/delivery-registration/delivery/${deliveryId}/package-with-images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de l'ajout du colis avec images");
    return null;
  }
};

// Service pour uploader des images pour un colis existant
export const uploadPackageImagesApi = async (
  packageId: string,
  imageFiles: File[],
  titles?: string[]
) => {
  try {
    const formData = new FormData();

    // Ajout des images
    imageFiles.forEach((file) => {
      formData.append("files", file);
    });

    // Ajout des titres d'images si présents
    if (titles && titles.length) {
      formData.append("titles", JSON.stringify(titles));
    }

    const response = await requestWrapper.post(
      `/packages/${packageId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de l'upload des images du colis");
    return null;
  }
};

// Service pour récupérer les images d'un colis
export const getPackageImagesApi = async (packageId: string) => {
  try {
    const response = await requestWrapper.get(`/packages/${packageId}/images`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des images du colis");
    return null;
  }
};

// Service pour supprimer une image d'un colis
export const deletePackageImageApi = async (
  packageId: string,
  imageId: string
) => {
  try {
    const response = await requestWrapper.delete(
      `/packages/${packageId}/images/${imageId}`
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la suppression de l'image du colis");
    return null;
  }
};

// Créer une nouvelle conversation.
export const createConversationApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/conversations", data);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la création de la conversation");
    return null;
  }
};

// Récupérer toutes les conversations de l'utilisateur courant.
export const getConversationsApi = async () => {
  try {
    const response = await requestWrapper.get("/conversations");
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des conversations");
    return null;
  }
};

// Récupérer une conversation par son ID.
export const getConversationByIdApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/conversations/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de la récupération de la conversation");
    return null;
  }
};

// Créer un nouveau message dans une conversation.
export const sendMessageConversationsApi = async (data: any) => {
  console.log("data", data);
  try {
    const response = await requestWrapper.post(
      `conversations/${data.conversationId}/messages`,
      data
    );
    return response.data;
  } catch (error) {
    handleError(error, "Erreur lors de l'envoi du message");
    return null;
  }
};

export const estimatePackage = async (packageData: any) => {
  try {
    const response = await requestWrapper.post(
      "/multi-step/package-estimate",
      packageData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("response.data", response.data);
    return response.data;
  } catch (error) {
    console.log("error", error);
    throw new Error("Erreur lors de l'estimation du colis");
  }
};

export const createDeliveryWithPackages = async (deliveryData: any) => {
  try {
    const response = await requestWrapper.post(
      "/multi-step/create-delivery",
      deliveryData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Erreur lors de la création de la livraison");
  }
};

export const addPackageImages = async ({
  packageId,
  images,
}: {
  packageId: string;
  images: FileList | File[];
}) => {
  try {
    const formData = new FormData();
    for (let i = 0; i < images.length; i++) {
      formData.append("images", images[i]);
    }
    const response = await requestWrapper.post(
      `/packages/${packageId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Erreur lors de l'ajout des images");
  }
};

export const verifyPaymentKeyAndPayTravelerApi = async ({
  deliveryId,
  tripId,
  paymentKey,
}: {
  deliveryId: string;
  tripId: string;
  paymentKey: string;
}) => {
  try {
    const response = await requestWrapper.post(`/payments/pay-traveler`, {
      deliveryId,
      tripId,
      paymentKey,
    });
    return response.data;
  } catch (error) {
    throw new Error("Erreur lors de la vérification de la clé de paiement");
  }
};
