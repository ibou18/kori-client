/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSession } from "next-auth/react";
import { NextApiRequest, NextApiResponse } from "next";

export default async function authMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  const session: any = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  const userRole = session.user?.role;

  if (!userRole) {
    return res.status(401).json({ message: "Non autorisé" });
  }

  // Contrôlez les accès en fonction du rôle de l'utilisateur
  if (req.url?.startsWith("/api/sms") || req.url?.startsWith("/api/users")) {
    if (userRole !== "admin" && userRole !== "manager") {
      return res.status(403).json({ message: "Accès refusé" });
    }
  }

  next();
}
