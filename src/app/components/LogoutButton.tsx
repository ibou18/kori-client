"use client";
import { LogOutIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import useUserStore from "../store/useUserStore";
import { PropsWithChildren } from "react";

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton = ({
  children,
  className,
}: PropsWithChildren<LogoutButtonProps>) => {
  const clearUser = useUserStore((state) => state.clearUser);

  const handleLogout = async () => {
    try {
      // Vider tous les cookies
      const cookies = document.cookie.split(";");
      cookies.forEach((cookie) => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });

      // Vider le localStorage
      localStorage.clear();

      // Vider le state global
      clearUser();

      // Se déconnecter avec next-auth
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <button
      className="text-slate-800 py-0 px-2 rounded-lg mt-2 flex gap-1 justify-center align-middle"
      onClick={handleLogout}
    >
      <LogOutIcon height={20} />
      {children}
    </button>
  );
};

export default LogoutButton;
