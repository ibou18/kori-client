/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { getSession } from "next-auth/react";

// Instance d'axios avec userId dans les paramètres
const apiClientWithUserId = axios.create({
  baseURL: process.env.NEXT_API_URL,
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
  baseURL: process.env.NEXT_API_URL,
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
