/**
 * Polices du mini-site, chargées statiquement par `next/font/google`
 * (auto-hébergées au build, zéro requête vers Google côté visiteur, pas de
 * flash de police). La liste est fermée : `next/font` exige des appels
 * déclaratifs au niveau module, impossible de charger une famille arbitraire.
 *
 * Trois paires sont proposées dans l'éditeur (KAN-16) : Bricolage Grotesque +
 * Inter (maquette), Playfair Display + Inter, DM Sans seule. Les six autres
 * familles restent chargées pour les sites qui les avaient choisies (P1).
 */
import {
  Bebas_Neue,
  Bricolage_Grotesque,
  Cormorant_Garamond,
  DM_Sans,
  Fraunces,
  Inter,
  Manrope,
  Playfair_Display,
  Poppins,
  Space_Grotesk,
} from "next/font/google";
import type { SalonSiteFontKey } from "./salonTheme";

const bricolage = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], weight: ["500", "700"], display: "swap" });
const inter = Inter({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600", "700"], display: "swap" });
const fraunces = Fraunces({ subsets: ["latin", "latin-ext"], weight: ["400", "600"], display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin", "latin-ext"], weight: ["500", "700"], display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin", "latin-ext"], weight: ["500", "700"], display: "swap" });
const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["400", "600", "800"], display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "700"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], weight: ["400", "600"], display: "swap" });
const poppins = Poppins({ subsets: ["latin", "latin-ext"], weight: ["400", "600", "700"], display: "swap" });
const bebas = Bebas_Neue({ subsets: ["latin", "latin-ext"], weight: ["400"], display: "swap" });

/** Famille CSS réelle des titres (nom généré par next/font) pour chaque clé. */
export const SALON_FONT_FAMILIES: Record<SalonSiteFontKey, string> = {
  BRICOLAGE: bricolage.style.fontFamily,
  PLAYFAIR: playfair.style.fontFamily,
  DM_SANS: dmSans.style.fontFamily,
  FRAUNCES: fraunces.style.fontFamily,
  CORMORANT: cormorant.style.fontFamily,
  MANROPE: manrope.style.fontFamily,
  SPACE_GROTESK: spaceGrotesk.style.fontFamily,
  POPPINS: poppins.style.fontFamily,
  BEBAS: bebas.style.fontFamily,
};

/** Famille CSS réelle du corps de texte pour chaque clé (Inter pour les paires de la maquette, DM Sans sinon). */
export const SALON_BODY_FONT_FAMILIES: Record<SalonSiteFontKey, string> = {
  BRICOLAGE: inter.style.fontFamily,
  PLAYFAIR: inter.style.fontFamily,
  DM_SANS: dmSans.style.fontFamily,
  FRAUNCES: dmSans.style.fontFamily,
  CORMORANT: dmSans.style.fontFamily,
  MANROPE: dmSans.style.fontFamily,
  SPACE_GROTESK: dmSans.style.fontFamily,
  POPPINS: dmSans.style.fontFamily,
  BEBAS: dmSans.style.fontFamily,
};
