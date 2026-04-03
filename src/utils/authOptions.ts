/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { apiClientWithoutUserId } from "./axiosConfig";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("No credentials provided");
        }

        try {
          console.log("credentials", credentials);
          console.log("🔗 Tentative de connexion à l'API...");
          const response = await apiClientWithoutUserId.post(
            "/auth/login",
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          // Récupérer les données selon la structure réelle du payload
          const responseData = response.data;

          // Vérifier que la réponse contient un utilisateur
          if (!responseData.user) {
            throw new Error(
              responseData.message || "Erreur d'authentification"
            );
          }

          const user = responseData.user;
          const token = responseData.token;
          const salon = responseData.salon as { id?: string; name?: string } | null | undefined;

          if (!user || !token) {
            throw new Error("Données d'authentification incomplètes");
          }

          // La vérification du mot de passe est déjà faite côté serveur,
          // car le token est renvoyé uniquement si l'authentification a réussi

          const salonId =
            salon?.id != null ? String(salon.id) : undefined;

          return {
            id: user.id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            token: token, // Utiliser le token du payload
            isVerified: user.isEmailVerified || false,
            phone: user.phone,
            avatar: user.avatar,
            salonId,
            salonName: salon?.name,
          };
        } catch (error: any) {
          console.error("❌ Error during authentication:", error);

          // Gestion spécifique des erreurs de connexion
          if (
            error.code === "ECONNREFUSED" ||
            error.message?.includes("ECONNREFUSED")
          ) {
            console.error("❌ Impossible de se connecter au serveur API");
            console.error(
              "💡 Vérifiez que le serveur backend est démarré sur http://localhost:2020"
            );
            throw new Error(
              "Impossible de se connecter au serveur. Vérifiez que le serveur backend est démarré."
            );
          }

          throw new Error(
            error.response?.data?.message ||
              error.message ||
              "Erreur de connexion"
          );
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.token = user.token;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.isVerified = user.isVerified;
        token.phone = user.phone;
        token.avatar = user.avatar;
        token.salonId = (user as { salonId?: string }).salonId;
        token.salonName = (user as { salonName?: string }).salonName;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.token = token.token;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.isVerified = token.isVerified;
        session.user.phone = token.phone;
        session.user.avatar = token.avatar;
        (session.user as { salonId?: string }).salonId = token.salonId as
          | string
          | undefined;
        (session.user as { salonName?: string }).salonName = token.salonName as
          | string
          | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    // error: "/auth/error",
  },
  debug: process.env.NODE_ENV === "development",
};
