/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  apiClientWithoutUserId,
  apiClientWithUserId,
} from "@/utils/axiosConfig";
// import axios from "axios";

export const fetcherWith = (url: string) =>
  apiClientWithUserId.get(url).then((res) => res.data);

export const fetcherWithout = (url: string) =>
  apiClientWithoutUserId.get(url).then((res) => res.data);

// import { getSession } from "next-auth/react";

// // Créez une instance Axios
// const axiosInstance = axios.create({
//   baseURL: process.env.NEXT_APP_API_URL, // Remplacez par votre URL de base
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Ajoutez un intercepteur pour inclure le token Bearer dans chaque requête
// axiosInstance.interceptors.request.use(
//   async (config) => {
//     const session: any = await getSession();
//     if (session && session.user && session.user.token) {
//       config.headers.Authorization = `Bearer ${session?.user.token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export const fetcher = (url: string) =>
//   axiosInstance.get(url).then((res) => res.data);

// export default axiosInstance;
