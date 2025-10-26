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
          const response = await apiClientWithoutUserId.post(
            `${process.env.NEXT_API_URL}/auth/login`,
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

          if (!responseData.success || !responseData.data) {
            throw new Error(
              responseData.message || "Erreur d'authentification"
            );
          }

          const user = responseData.data.user;
          const token = responseData.data.token;

          if (!user) {
            throw new Error("Aucun utilisateur trouvé avec cet email");
          }

          // La vérification du mot de passe est déjà faite côté serveur,
          // car le token est renvoyé uniquement si l'authentification a réussi
          // Suppression de la vérification bcrypt ici

          return {
            id: user.id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            token: token, // Utiliser le token du payload
            isVerified: user.isVerified,
            verificationStatus: user.verificationStatus,
            // Autres données si nécessaire
          };
        } catch (error: any) {
          console.error("Error during authentication:", error);
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
        token.verificationStatus = user.verificationStatus;
        // Autres données si nécessaire
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
        session.user.verificationStatus = token.verificationStatus;
        // Autres données si nécessaire
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
