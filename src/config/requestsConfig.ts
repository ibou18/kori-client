/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { getSession } from "next-auth/react";

// URL de base de l'API avec valeur par défaut
const API_BASE_URL = process.env.NEXT_API_URL || "http://localhost:2020";

// Request wrapper
export const requestWrapper = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

requestWrapper.interceptors.request.use(
  async (config) => {
    const session: any = await getSession();

    if (session && session.user.token) {
      config.headers.Authorization = `Bearer ${session.user.token}`;
    } else {
      console.log("⚠️ No token found in AsyncStorage");
    }

    // console.log("📤 Request Config:", {
    //   url: config.url,
    //   method: config.method,
    //   headers: config.headers,
    // });

    return config;
  },
  (error) => {
    console.error("❌ Request Interceptor Error:", error);
    return Promise.reject(error);
  }
);

/**
 * Gère les erreurs des requêtes API en fournissant un format cohérent.
 *
 * @param err L'erreur originale (généralement de type AxiosError)
 * @param customMsg Message personnalisé ou objet de messages par code HTTP
 * @returns Ne retourne jamais, lance toujours une erreur enrichie
 */
export const handleError = (
  err: any,
  customMsg?: string | Record<number, string>
): never => {
  // Extraire les informations de base de l'erreur
  const status = err.response?.status || err.status || 500;
  const responseData = err.response?.data;

  // Déterminer le message d'erreur en fonction de la structure disponible
  let errorMessage: string;
  let errorType: string | undefined;

  // Cas 1: Format structuré {error, message} dans response.data
  if (responseData && typeof responseData === "object") {
    if (responseData.error && responseData.message) {
      errorType = responseData.error;
      errorMessage = responseData.message;
    }
    // Cas 2: Autres formats possibles dans response.data
    else {
      errorMessage =
        responseData.msg ||
        responseData.message ||
        responseData.error ||
        `Erreur ${status}`;
    }
  }
  // Cas 3: Erreur Axios standard sans données supplémentaires
  else {
    errorMessage = err.message || `Erreur ${status} non spécifiée`;
  }

  // Assembler le message final en fonction du type de customMsg
  let finalMessage: string;

  if (typeof customMsg === "string") {
    finalMessage = `${customMsg}: ${errorMessage}`;
    errorType = customMsg;
  } else if (customMsg && typeof customMsg === "object" && customMsg[status]) {
    finalMessage = `${customMsg[status]}: ${errorMessage}`;
    errorType = customMsg[status];
  } else {
    finalMessage = errorMessage;
  }

  // Logger l'erreur pour débogage avec toutes les informations disponibles
  const errorLog: any = {
    status: status || "unknown",
    url: err.config?.url || err.request?.url || err.config?.baseURL || "unknown",
    method: (err.config?.method || err.request?.method || "unknown").toUpperCase(),
    message: finalMessage || errorMessage || "Erreur inconnue",
  };

  // Ajouter responseData seulement s'il contient des informations
  if (responseData) {
    if (typeof responseData === "object") {
      const keys = Object.keys(responseData);
      if (keys.length > 0) {
        errorLog.responseData = responseData;
      } else {
        errorLog.responseData = "(empty object)";
      }
    } else {
      errorLog.responseData = responseData;
    }
  } else {
    errorLog.responseData = "(no response data)";
  }

  // Ajouter des informations supplémentaires pour le débogage
  if (err.response) {
    errorLog.response = {
      status: err.response.status || "unknown",
      statusText: err.response.statusText || "unknown",
      data: err.response.data || "(no data)",
    };
  }

  if (err.message) {
    errorLog.errorMessage = err.message;
  }

  // Ajouter les informations de la requête si disponibles
  if (err.config) {
    errorLog.request = {
      url: err.config.url || "unknown",
      baseURL: err.config.baseURL || "unknown",
      method: (err.config.method || "unknown").toUpperCase(),
    };
  }

  // Ajouter l'erreur brute pour le débogage complet
  errorLog.rawError = {
    name: err.name || "unknown",
    code: err.code || "unknown",
    stack: err.stack ? err.stack.split("\n").slice(0, 3).join("\n") : "no stack",
  };

  console.error("API Error:", JSON.stringify(errorLog, null, 2));

  // Enrichir l'erreur originale avec des informations structurées
  err.formattedMessage = finalMessage;
  err.errorDetails = {
    status,
    message: errorMessage,
    type: errorType,
    responseData,
  };

  // Lancer l'erreur enrichie
  throw err;
};

// Function to display success message from response
export const handleResponse = (res: any, msg: any) => {
  const status = res?.status;
  const responseMessage = res.data?.msg || res.data?.message;
  if (typeof msg === "string") {
    // message.success(msg);
  } else if (typeof msg === "object" && msg[status]) {
    console.error(msg[status]);
  } else if (responseMessage) {
    // message.success(responseMessage);
  }
  return res;
};

// Function to convert JSON data to Form Data
export const convertJSONDataToFormData = (data: any) => {
  // create FormData object that will be sent to endpoint
  const formData = new FormData();
  // append a "files" key containing Files objects from data values
  if (data.files) {
    data.files.forEach((file: any) => {
      formData.append("files[]", file.originFileObj);
    });
  }
  // remove the file key from data values
  delete data.files;
  // append the rest of the data as a stringified json into a "body" key of the FormData
  formData.append("body", JSON.stringify(data));
  // return formData value
  return formData;
};

// const codeMessage = {
// 	200: "The server successfully returned the requested data.",
// 	201: "New or modified data is successful.",
// 	202: "A request has entered the background queue (asynchronous task).",
// 	204: "The data was deleted successfully.",
// 	400: "The request was made with an error and the server did not perform any new or modified data operations.",
// 	401: "User does not have permission (token, username, password is incorrect).",
// 	403: "The user is authorized, but access is forbidden.",
// 	404: "The request is made for a record that does not exist and the server does not operate.",
// 	406: "The format of the request is not available.",
// 	410: "The requested resource is permanently deleted and will not be retrieved.",
// 	422: "A validation error occurred when creating an object.",
// 	500: "An error occurred on the server. Please check the server.",
// 	502: "Gateway error.",
// 	503: "The service is unavailable and the server is temporarily overloaded or maintained.",
// 	504: "The gateway timed out.",
// };

// const lol = JSON.stringify(process.env.API_URL);
// const lol1 = JSON.parse(JSON.stringify(process.env.API_URL));

// const BASE_URL = JSON.stringify(process.env.API_URL)
// 	? JSON.stringify(process.env.API_URL) + "/"
// 	: "/";
