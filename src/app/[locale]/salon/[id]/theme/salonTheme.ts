/**
 * Thème du mini-site d'un salon (docs/SALON_MINI_SITE.md côté serveur).
 *
 * Le serveur renvoie `salon.site` (table `salon_sites`) ou `null`. Ce module
 * transforme cette donnée en un thème complet et sûr : couleurs validées,
 * couleur de texte calculée pour rester lisible, police résolue dans une liste
 * fermée. Aucune dépendance React : testable en isolation.
 */

export type SalonSiteTemplate = "CLASSIC" | "EDITORIAL" | "BOLD";

/** Messages `postMessage` entre l'éditeur (`/admin/mon-site`) et l'iframe d'aperçu (`?preview=1`). */
export const SALON_SITE_PREVIEW_MESSAGE = "kori:salon-site-preview";
export const SALON_SITE_PREVIEW_READY = "kori:salon-site-preview-ready";

export type SalonSiteFontKey =
  | "FRAUNCES"
  | "PLAYFAIR"
  | "CORMORANT"
  | "MANROPE"
  | "DM_SANS"
  | "SPACE_GROTESK"
  | "POPPINS"
  | "BEBAS";

/** Forme brute renvoyée par l'API (`GET /salons/:id/detail` → `data.site`). */
export interface SalonSiteDto {
  template?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  font?: string | null;
  logoUrl?: string | null;
  tagline?: string | null;
  isPublished?: boolean | null;
}

/** Thème résolu, prêt à être injecté en CSS variables. */
export interface SalonTheme {
  template: SalonSiteTemplate;
  primaryColor: string;
  secondaryColor: string;
  /** Texte posé sur `primaryColor` (blanc ou noir, selon le contraste). */
  onPrimary: string;
  onSecondary: string;
  font: SalonSiteFontKey;
  logoUrl: string | null;
  tagline: string | null;
  /** `true` si le salon a personnalisé quelque chose (ligne `salon_sites`). */
  isCustomized: boolean;
}

export interface SalonFontOption {
  key: SalonSiteFontKey;
  /** Nom affiché dans l'éditeur. */
  label: string;
  /** Mot d'ambiance pour l'éditeur. */
  mood: string;
  /** Famille CSS (avec repli) ; la vraie police est chargée par `fonts.ts`. */
  family: string;
  /** Bebas est en capitales : titres plus petits pour tenir sur une ligne. */
  uppercase?: boolean;
}

export const SALON_FONT_OPTIONS: readonly SalonFontOption[] = [
  { key: "FRAUNCES", label: "Fraunces", mood: "élégant, chaleureux", family: '"Fraunces", Georgia, serif' },
  { key: "PLAYFAIR", label: "Playfair Display", mood: "classique, haute couture", family: '"Playfair Display", Georgia, serif' },
  { key: "CORMORANT", label: "Cormorant Garamond", mood: "fin, raffiné", family: '"Cormorant Garamond", Georgia, serif' },
  { key: "MANROPE", label: "Manrope", mood: "moderne, doux", family: '"Manrope", system-ui, sans-serif' },
  { key: "DM_SANS", label: "DM Sans", mood: "sobre, neutre", family: '"DM Sans", system-ui, sans-serif' },
  { key: "SPACE_GROTESK", label: "Space Grotesk", mood: "technique, tendance", family: '"Space Grotesk", system-ui, sans-serif' },
  { key: "POPPINS", label: "Poppins", mood: "rond, amical", family: '"Poppins", system-ui, sans-serif' },
  { key: "BEBAS", label: "Bebas Neue", mood: "enseigne, capitales", family: '"Bebas Neue", Impact, sans-serif', uppercase: true },
] as const;

export const SALON_TEMPLATES: readonly { key: SalonSiteTemplate; label: string; description: string; available: boolean }[] = [
  { key: "CLASSIC", label: "Classique", description: "Bandeau photos, logo à gauche, cartes arrondies.", available: true },
  { key: "EDITORIAL", label: "Éditorial", description: "Grands titres, mise en page magazine.", available: false },
  { key: "BOLD", label: "Audacieux", description: "Fond sombre, nom en très grand.", available: false },
];

/** Palettes proposées dans l'éditeur (le pro peut aussi saisir une couleur libre). */
export const PRIMARY_PRESETS = ["#53745D", "#2A3731", "#7A3E48", "#1F3A5F", "#5B3E8C", "#B4552D", "#1B1B1B", "#C2185B"] as const;
export const SECONDARY_PRESETS = ["#D9A441", "#F6E7C8", "#E8B4B8", "#9FD3C7", "#F2C14E", "#FF8A5B", "#E0E0E0", "#86C5DA"] as const;

/** Thème korí : rendu de la page avant personnalisation. */
export const DEFAULT_SALON_THEME: SalonTheme = {
  template: "CLASSIC",
  primaryColor: "#53745D",
  secondaryColor: "#D9A441",
  onPrimary: "#FFFFFF",
  onSecondary: "#1B1B1B",
  font: "FRAUNCES",
  logoUrl: null,
  tagline: null,
  isCustomized: false,
};

const HEX_RE = /^#?([0-9a-f]{6})$/i;

export function normalizeHex(value: string | null | undefined): string | null {
  if (!value) return null;
  const m = HEX_RE.exec(value.trim());
  return m ? `#${m[1].toUpperCase()}` : null;
}

function relativeLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

/** Ratio de contraste WCAG entre deux couleurs hex `#RRGGBB`. */
export function contrastRatio(a: string, b: string): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Blanc ou quasi-noir, celui qui contraste le plus avec `hex`. */
export function onColor(hex: string): string {
  return contrastRatio(hex, "#FFFFFF") >= contrastRatio(hex, "#1B1B1B") ? "#FFFFFF" : "#1B1B1B";
}

export function isFontKey(value: unknown): value is SalonSiteFontKey {
  return SALON_FONT_OPTIONS.some((f) => f.key === value);
}

export function isTemplateKey(value: unknown): value is SalonSiteTemplate {
  return SALON_TEMPLATES.some((t) => t.key === value);
}

/** Construit un thème complet depuis la donnée API (tolérant aux valeurs invalides). */
export function resolveSalonTheme(site: SalonSiteDto | null | undefined): SalonTheme {
  if (!site) return DEFAULT_SALON_THEME;
  const primaryColor = normalizeHex(site.primaryColor) ?? DEFAULT_SALON_THEME.primaryColor;
  const secondaryColor = normalizeHex(site.secondaryColor) ?? DEFAULT_SALON_THEME.secondaryColor;
  return {
    template: isTemplateKey(site.template) ? site.template : "CLASSIC",
    primaryColor,
    secondaryColor,
    onPrimary: onColor(primaryColor),
    onSecondary: onColor(secondaryColor),
    font: isFontKey(site.font) ? site.font : DEFAULT_SALON_THEME.font,
    logoUrl: site.logoUrl?.trim() ? site.logoUrl : null,
    tagline: site.tagline?.trim() ? site.tagline.trim() : null,
    isCustomized: true,
  };
}

export function getFontOption(key: SalonSiteFontKey): SalonFontOption {
  return SALON_FONT_OPTIONS.find((f) => f.key === key) ?? SALON_FONT_OPTIONS[0];
}

const IGNORED_WORDS = new Set([
  "le", "la", "les", "l", "de", "du", "des", "d", "et", "au", "aux", "un", "une",
  "the", "of", "and", "a", "an", "by", "chez",
]);

/**
 * Monogramme du salon quand il n'a pas de logo : « Atelier Nova » → « AN »,
 * « L'Atelier de Nova » → « AN », « My salon » → « MS », « Nova » → « N ».
 */
export function salonInitials(name: string | null | undefined): string {
  if (!name) return "";
  const words = name
    .replace(/['’]/g, " ")
    .split(/[\s\-–—_/&+.,]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && !IGNORED_WORDS.has(w.toLowerCase()));
  const source = words.length ? words : name.split(/\s+/).filter(Boolean);
  return source
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** Variables CSS consommées par les sections (`var(--site-primary)` …). */
export function themeToCssVars(theme: SalonTheme): Record<string, string> {
  const font = getFontOption(theme.font);
  return {
    "--site-primary": theme.primaryColor,
    "--site-secondary": theme.secondaryColor,
    "--site-on-primary": theme.onPrimary,
    "--site-on-secondary": theme.onSecondary,
    "--site-font-display": font.family,
  };
}

/** Mélange `hex` avec du blanc ou du noir (0 ≤ amount ≤ 1) pour fonds/voiles. */
export function mixHex(hex: string, target: "#FFFFFF" | "#000000", amount: number): string {
  const a = parseInt(hex.slice(1), 16);
  const b = parseInt(target.slice(1), 16);
  const ch = (shift: number) => {
    const x = (a >> shift) & 255;
    const y = (b >> shift) & 255;
    return Math.round(x + (y - x) * amount);
  };
  return `#${[ch(16), ch(8), ch(0)].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}
