import logoblack from "../assets/logo-black.png";
import logowhite from "../assets/logo-black.png";

export const LOGO_BLACK = logoblack;
export const LOGO_WHITE = logowhite;

export function normalizePathname(pathname: string) {
  return pathname.replace(/^\/(fr|en|es)/, ""); // Supprime le préfixe de langue
}
