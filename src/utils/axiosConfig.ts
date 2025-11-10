/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { getSession } from "next-auth/react";

// URL de base de l'API avec valeur par défaut
const API_BASE_URL =
  process.env.NEXT_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:2020";

// Log pour déboguer (uniquement en développement)
if (process.env.NODE_ENV === "development") {
  console.log("🔗 API Base URL:", API_BASE_URL);
}

// Instance d'axios avec userId dans les paramètres
const apiClientWithUserId = axios.create({
  baseURL: API_BASE_URL,
});

apiClientWithUserId.interceptors.request.use(
  async (config) => {
    const session: any = await getSession();

    if (session && session.user.token) {
      config.headers.Authorization = `Bearer ${session.user.token}`;
    }
    if (session && session.user.id) {
      config.params = {
        ...config.params,
        userId: session.user.id,
      };
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Instance d'axios sans userId dans les paramètres
const apiClientWithoutUserId = axios.create({
  baseURL: API_BASE_URL,
});

apiClientWithoutUserId.interceptors.request.use(
  async (config) => {
    const session: any = await getSession();
    if (session && session.user.token) {
      config.headers.Authorization = `Bearer ${session.user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { apiClientWithUserId, apiClientWithoutUserId };
