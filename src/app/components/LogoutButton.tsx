"use client";
import { cn } from "@/lib/utils";
import { LogOutIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { PropsWithChildren } from "react";
import useUserStore from "../store/useUserStore";

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
      type="button"
      className={cn(
        "text-slate-800 py-0 px-2 rounded-lg mt-2 flex gap-1 justify-center items-center align-middle",
        className
      )}
      onClick={handleLogout}
    >
      <LogOutIcon height={20} />
      {children}
    </button>
  );
};

export default LogoutButton;
