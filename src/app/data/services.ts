import { handleError, requestWrapper } from "../../config/requestsConfig";
import { IPlan, IInvoice } from "../interface";

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

export const createClientApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/clients", data);
    return response.data;
  } catch (error) {
    handleError(error, "Error creating client");
    return null;
  }
};

export const getClientsApi = async () => {
  try {
    const response = await requestWrapper.get(`/clients`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching clients");

    return null;
  }
};

export const getClientApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/clients/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching client");
    return null;
  }
};

export const deleteClientApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/clients/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error deleting client");
    return null;
  }
};

export const updateClientApi = async (data: any) => {
  try {
    const response = await requestWrapper.put(`/clients/${data.id}`, data.data);
    return response.data;
  } catch (error) {
    handleError(error, "Error updating client");
    return null;
  }
};

export const getProductsApi = async () => {
  try {
    const response = await requestWrapper.get("/subscriptions/products");
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching plans");
    return null;
  }
};

// _________ Pans __________
// Créer un plan
export const createPlanApi = async (data: IPlan) => {
  try {
    const response = await requestWrapper.post("/plans", data);
    return response.data;
  } catch (error) {
    handleError(error, "Error creating plan");
    return null;
  }
};
// Récupérer tous les plans

// Récupérer un plan par son ID
export const getPlanApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/plans/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching plan");
    return null;
  }
};
// Mettre à jour un plan
export const updatePlanApi = async (data: {
  id: string;
  data: Partial<IPlan>;
}) => {
  try {
    const response = await requestWrapper.put(`/plans/${data.id}`, data.data);
    return response.data;
  } catch (error) {
    handleError(error, "Error updating plan");
    return null;
  }
};
// Supprimer un plan
export const deletePlanApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/plans/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error deleting plan");
    return null;
  }
};

// Forgot password
export const forgotPasswordApi = async (email: string) => {
  try {
    const response = await requestWrapper.post("/auth/forgot-password", {
      email,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Error sending forgot password email");
    return null;
  }
};

//Reset password
export const resetPasswordApi = async ({
  token,
  password,
}: {
  token: any;
  password: string;
}) => {
  try {
    const response = await requestWrapper.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  } catch (error) {
    handleError(error, "Error resetting password");
    return null;
  }
};

// _________ Checkout Stripe Paiement __________
export const checkoutStripeApi = async (data: any) => {
  try {
    const response = await requestWrapper.post(
      "/subscriptions/create-checkout-session",
      data
    );
    return response.data;
  } catch (error) {
    handleError(error, "Error checking out");
    return null;
  }
};

export const currentSubscriptionApi = async () => {
  try {
    const response = await requestWrapper.get("/subscriptions/current");
    return response.data;
  } catch (error) {
    handleError(error, "Error checking out");
    return null;
  }
};

export const getSmsApi = async () => {
  try {
    const response = await requestWrapper.get("/sms");
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching stats");
    return null;
  }
};

export const sendSmsApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/sms", data);
    return response.data;
  } catch (error) {
    handleError(error, "Error sending sms");
    return null;
  }
};

export const sendSmsBulkApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/sms/send", data);
    return response.data;
  } catch (error) {
    handleError(error, "Error sending sms");
    return null;
  }
};

// _________ Invoices __________

//Send invoice by email

export const sendInvoiceApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/invoices/send-mail", data);
    return response.data;
  } catch (error) {
    handleError(error, "Error sending invoice");
    return null;
  }
};
// Créer une facture
export const createInvoiceApi = async (data: IInvoice) => {
  try {
    const response = await requestWrapper.post("/invoices", data);
    return response.data;
  } catch (error: any) {
    // Capture l'erreur spécifique si disponible
    const errorResponse = error.response?.data;

    // Si l'erreur indique que la mise à niveau est requise, on la renvoie telle quelle
    if (errorResponse?.upgradeRequired) {
      throw {
        message: errorResponse.error || "Limite du plan atteinte",
        upgradeRequired: true,
      };
    }

    // Sinon, on utilise le gestionnaire d'erreur standard
    handleError(error, "Error creating invoice");
    throw error; // On s'assure que l'erreur est propagée pour être traitée par le hook
  }
};

export const getInvoicesApi = async () => {
  try {
    const response = await requestWrapper.get(`/invoices`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching invoices");
    return null;
  }
};

// stats invoices
export const getStatsInvoicesApi = async () => {
  try {
    const response = await requestWrapper.get(`/invoices/stats`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching invoices");
    return null;
  }
};

// Récupérer un Paiements par son ID
export const getInvoiceApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/invoices/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching invoices");
    return null;
  }
};
// Mettre à jour un Paiements
export const updateInvoiceApi = async (data: any) => {
  console.log("data_updateInvoiceApi", data);
  try {
    const response = await requestWrapper.put(`/invoices/${data.id}`, data);
    return response.data;
  } catch (error) {
    handleError(error, "Error updating invoices");
    return null;
  }
};

// Supprimer un Paiements
export const deleteInvoiceApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/invoices/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error deleting invoices");
    return null;
  }
};

// _________ Fin Invoices __________

// _________ Receipts __________
// Get all receipts
export const getReceiptsApi = async () => {
  try {
    const response = await requestWrapper.get(`/receipts`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching receipts");
    return null;
  }
};

export const getStatsReceiptsApi = async () => {
  try {
    const response = await requestWrapper.get(`/receipts/stats`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching receipts");
    return null;
  }
};

//create a receipt
export const createReceiptApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/receipts", data);
    return response.data;
  } catch (error: any) {
    // Capture l'erreur spécifique si disponible
    const errorResponse = error.response?.data;

    // Si l'erreur indique que la mise à niveau est requise, on la renvoie telle quelle
    if (errorResponse?.upgradeRequired) {
      throw {
        message: errorResponse.message || "Limite du plan atteinte",
        upgradeRequired: true,
      };
    }

    // Sinon, on utilise le gestionnaire d'erreur standard
    handleError(error, "Error creating invoice");
    throw error; // On s'assure que l'erreur est propagée pour être traitée par le hook
  }
};

// Get a receipt by its ID
export const getReceiptApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/receipts/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching receipt");
    return null;
  }
};

// Get a receipt by its ID
export const getReceiptTaxesApi = async () => {
  try {
    const response = await requestWrapper.get(`/receipts/taxes`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching receipt");
    return null;
  }
};

// Update a receipt
export const updateReceiptApi = async (data: any) => {
  try {
    const response = await requestWrapper.put(`/receipts/${data.id}`, data);
    return response.data;
  } catch (error) {
    handleError(error, "Error updating receipt");
    return null;
  }
};

// Delete a receipt
export const deleteReceiptApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/receipts/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error deleting receipt");
    return null;
  }
};

// _________ Fin Receipts __________

// _________ Trackings __________
// Get all trackings
export const getTrackingsApi = async () => {
  try {
    const response = await requestWrapper.get(`/trackings`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching trackings");
    return null;
  }
};

//create a tracking
export const createTrackingApi = async (data: any) => {
  try {
    const response = await requestWrapper.post("/trackings", data);
    return response.data;
  } catch (error) {
    handleError(error, "Error creating tracking");
    return null;
  }
};

// Get a tracking by its ID
export const getTrackingApi = async () => {
  try {
    const response = await requestWrapper.get(`/trackings}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching tracking");
    return null;
  }
};

// Update a tracking
export const updateTrackingApi = async (data: any) => {
  console.log("data____", data);
  try {
    const response = await requestWrapper.put(`/trackings/${data.id}`, data);
    return response.data;
  } catch (error) {
    handleError(error, "Error updating tracking");
    return null;
  }
};

// Delete a tracking
export const deleteTrackingApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/trackings/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error deleting tracking");
    return null;
  }
};

// _________ Stats __________
// Get all stats
export const getStatsApi = async () => {
  try {
    const response = await requestWrapper.get(`/trackings/stats`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching stats");
    return null;
  }
};

// _________ Subscriptions __________

// Get current user subscription
export const getSubscriptionsApi = async () => {
  try {
    const response = await requestWrapper.get("/subscriptions");
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching current subscription");
    return null;
  }
};

export const getSubscriptionsByCessionApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/subscriptions/session/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error fetching current subscription");
    return null;
  }
};

// Create a new subscription
export const createSubscriptionApi = async (data: {
  planId: string;
  billingCycle: "MONTHLY" | "ANNUAL";
}) => {
  try {
    const response = await requestWrapper.post("/subscriptions", data);
    return response.data;
  } catch (error) {
    handleError(error, "Error creating subscription");
    return null;
  }
};

// Cancel subscription
export const cancelSubscriptionApi = async (subscriptionId: string) => {
  try {
    const response = await requestWrapper.delete(
      `/subscriptions/${subscriptionId}`
    );
    return response.data;
  } catch (error) {
    handleError(error, "Error canceling subscription");
    return null;
  }
};

// Update subscription
export const updateSubscriptionApi = async (
  subscriptionId: string,
  data: any
) => {
  try {
    const response = await requestWrapper.put(
      `/subscriptions/${subscriptionId}`,
      data
    );
    return response.data;
  } catch (error) {
    handleError(error, "Error updating subscription");
    return null;
  }
};

export const getPortalBillingApi = async () => {
  try {
    const response = await requestWrapper.get(`/subscriptions/portal`);
    return response.data;
  } catch (error) {
    handleError(error, "Error updating subscription");
    return null;
  }
};

export const getCurrentStatusApi = async () => {
  try {
    const response = await requestWrapper.get(`/subscriptions/current-status`);
    return response.data;
  } catch (error) {
    handleError(error, "Error get Current subscription");
    return null;
  }
};

export const getSettingsApi = async () => {
  try {
    const response = await requestWrapper.get(`/settings`);
    return response.data;
  } catch (error) {
    handleError(error, "Error get All Settings");
    return null;
  }
};

export const updateSettingApi = async (data: any) => {
  try {
    const response = await requestWrapper.put(`/settings/${data.id}`, data);
    return response.data;
  } catch (error) {
    handleError(error, "Error POST Setting");
    return null;
  }
};

export const getCompaniesApi = async () => {
  try {
    const response = await requestWrapper.get(`/companies`);
    return response.data;
  } catch (error) {
    handleError(error, "Error get All companies Api");
    return null;
  }
};

export const getCompanyApi = async (id: string) => {
  try {
    const response = await requestWrapper.get(`/companies/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error get All companies Api");
    return null;
  }
};

export const getLimitsCheckApi = async () => {
  try {
    const response = await requestWrapper.get(`/limits/check`);
    return response.data;
  } catch (error) {
    handleError(error, "Error get Limits Check");
    return null;
  }
};

export const deleteCompanyApi = async (id: string) => {
  try {
    const response = await requestWrapper.delete(`/companies/${id}`);
    return response.data;
  } catch (error) {
    handleError(error, "Error delete companie");
    return null;
  }
};
