/**
 * Polices des titres du mini-site, chargées statiquement par `next/font/google`
 * (auto-hébergées au build, zéro requête vers Google côté visiteur, pas de
 * flash de police). La liste est fermée : `next/font` exige des appels
 * déclaratifs au niveau module, impossible de charger une famille arbitraire.
 */
import {
  Bebas_Neue,
  Cormorant_Garamond,
  DM_Sans,
  Fraunces,
  Manrope,
  Playfair_Display,
  Poppins,
  Space_Grotesk,
} from "next/font/google";
import type { SalonSiteFontKey } from "./salonTheme";

const fraunces = Fraunces({ subsets: ["latin", "latin-ext"], weight: ["400", "600"], display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin", "latin-ext"], weight: ["500", "700"], display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin", "latin-ext"], weight: ["500", "700"], display: "swap" });
const manrope = Manrope({ subsets: ["latin", "latin-ext"], weight: ["400", "600", "800"], display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "700"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin", "latin-ext"], weight: ["400", "600"], display: "swap" });
const poppins = Poppins({ subsets: ["latin", "latin-ext"], weight: ["400", "600", "700"], display: "swap" });
const bebas = Bebas_Neue({ subsets: ["latin", "latin-ext"], weight: ["400"], display: "swap" });

/** Famille CSS réelle (nom généré par next/font) pour chaque clé. */
export const SALON_FONT_FAMILIES: Record<SalonSiteFontKey, string> = {
  FRAUNCES: fraunces.style.fontFamily,
  PLAYFAIR: playfair.style.fontFamily,
  CORMORANT: cormorant.style.fontFamily,
  MANROPE: manrope.style.fontFamily,
  DM_SANS: dmSans.style.fontFamily,
  SPACE_GROTESK: spaceGrotesk.style.fontFamily,
  POPPINS: poppins.style.fontFamily,
  BEBAS: bebas.style.fontFamily,
};

/** Police du corps de texte du mini-site (fixe, quelle que soit la police des titres). */
export const SALON_BODY_FONT_FAMILY = dmSans.style.fontFamily;
