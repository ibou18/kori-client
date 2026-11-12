/**
 * Thème du mini-site d'un salon (docs/SALON_MINI_SITE.md côté serveur, ticket KAN-16).
 *
 * Le serveur renvoie `salon.site` (table `salon_sites`) ou `null`. Ce module
 * transforme cette donnée en un thème complet et sûr :
 *
 * - un **gabarit** d'entête (`template`) parmi trois, chacun avec ou sans logo (`showLogo`) ;
 * - une **palette** complète (fond, texte, surfaces, bordures, accent…) issue d'un
 *   thème prédéfini (`MONO`, `KORI`, `ROSY`) ou dérivée de deux couleurs libres (`CUSTOM`) ;
 * - une **paire de polices** (titres + corps) résolue dans une liste fermée.
 *
 * Aucune dépendance React : testable en isolation (`salonTheme.test.ts`).
 */

export type SalonSiteTemplate = "CLASSIC" | "BANNER" | "COMPACT";
export type SalonSiteColorTheme = "MONO" | "KORI" | "ROSY" | "CUSTOM";

/** Messages `postMessage` entre l'éditeur (`/admin/mon-site`) et l'iframe d'aperçu (`?preview=1`). */
export const SALON_SITE_PREVIEW_MESSAGE = "kori:salon-site-preview";
export const SALON_SITE_PREVIEW_READY = "kori:salon-site-preview-ready";

export type SalonSiteFontKey =
  | "BRICOLAGE"
  | "PLAYFAIR"
  | "DM_SANS"
  // Clés historiques (P1) : toujours rendues, plus proposées dans l'éditeur.
  | "FRAUNCES"
  | "CORMORANT"
  | "MANROPE"
  | "SPACE_GROTESK"
  | "POPPINS"
  | "BEBAS";

/** Forme brute renvoyée par l'API (`GET /salons/:id/detail` → `data.site`). */
export interface SalonSiteDto {
  template?: string | null;
  colorTheme?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  font?: string | null;
  showLogo?: boolean | null;
  logoUrl?: string | null;
  tagline?: string | null;
  isPublished?: boolean | null;
}

/**
 * Palette complète d'une page. Toutes les couleurs sont des hex `#RRGGBB`.
 * Les noms suivent la maquette : `surface` = bandes beige/gris sous l'entête,
 * `surface2` = cartes récapitulatives, `media` = fond des photos en chargement.
 */
export interface SalonPalette {
  /** Fond de page. */
  bg: string;
  /** Texte principal. */
  fg: string;
  /** Texte secondaire (descriptions, récapitulatifs). */
  fg2: string;
  /** Texte atténué (surtitres, légendes). */
  muted: string;
  /** Fond doux (bloc identité, pied de page, boutons retour). */
  surface: string;
  /** Fond des cartes (récap, conditions). */
  surface2: string;
  /** Séparateurs. */
  border: string;
  /** Bordure des champs et boutons secondaires. */
  borderStrong: string;
  /** Bordure des pastilles de catégorie. */
  chipBorder: string;
  /** Couleur d'action : CTA, filtre actif, barre de progression, liens. */
  accent: string;
  /** Texte posé sur `accent` (blanc ou quasi-noir selon le contraste). */
  onAccent: string;
  /** Teinte très claire de l'accent (sélection, badges). */
  accentSoft: string;
  /** Fond des images en attente. */
  media: string;
  /** Étoiles de notation. */
  star: string;
}

/** Thème résolu, prêt à être injecté en CSS variables. */
export interface SalonTheme {
  template: SalonSiteTemplate;
  colorTheme: SalonSiteColorTheme;
  /** Accent du thème `CUSTOM` (ignoré pour les thèmes prédéfinis). */
  primaryColor: string;
  /** Fond doux du thème `CUSTOM` (ignoré pour les thèmes prédéfinis). */
  secondaryColor: string;
  palette: SalonPalette;
  font: SalonSiteFontKey;
  /** `false` : entête sans logo ni monogramme, quel que soit `logoUrl`. */
  showLogo: boolean;
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
  /** Famille CSS des titres (avec repli) ; la vraie police est chargée par `fonts.ts`. */
  family: string;
  /** Famille CSS du corps de texte (avec repli). */
  bodyFamily: string;
  /** Proposée dans l'éditeur (trois paires, KAN-16). */
  featured: boolean;
  /** Bebas est en capitales : titres plus petits pour tenir sur une ligne. */
  uppercase?: boolean;
}

const INTER = '"Inter", system-ui, sans-serif';
const DM_SANS = '"DM Sans", system-ui, sans-serif';

export const SALON_FONT_OPTIONS: readonly SalonFontOption[] = [
  { key: "BRICOLAGE", label: "Moderne", mood: "Bricolage Grotesque · Inter", family: '"Bricolage Grotesque", system-ui, sans-serif', bodyFamily: INTER, featured: true },
  { key: "PLAYFAIR", label: "Élégant", mood: "Playfair Display · Inter", family: '"Playfair Display", Georgia, serif', bodyFamily: INTER, featured: true },
  { key: "DM_SANS", label: "Doux", mood: "DM Sans", family: DM_SANS, bodyFamily: DM_SANS, featured: true },
  { key: "FRAUNCES", label: "Fraunces", mood: "élégant, chaleureux", family: '"Fraunces", Georgia, serif', bodyFamily: DM_SANS, featured: false },
  { key: "CORMORANT", label: "Cormorant Garamond", mood: "fin, raffiné", family: '"Cormorant Garamond", Georgia, serif', bodyFamily: DM_SANS, featured: false },
  { key: "MANROPE", label: "Manrope", mood: "moderne, doux", family: '"Manrope", system-ui, sans-serif', bodyFamily: DM_SANS, featured: false },
  { key: "SPACE_GROTESK", label: "Space Grotesk", mood: "technique, tendance", family: '"Space Grotesk", system-ui, sans-serif', bodyFamily: DM_SANS, featured: false },
  { key: "POPPINS", label: "Poppins", mood: "rond, amical", family: '"Poppins", system-ui, sans-serif', bodyFamily: DM_SANS, featured: false },
  { key: "BEBAS", label: "Bebas Neue", mood: "enseigne, capitales", family: '"Bebas Neue", Impact, sans-serif', bodyFamily: DM_SANS, featured: false, uppercase: true },
] as const;

/** Les trois paires proposées dans l'éditeur. */
export const FEATURED_FONT_OPTIONS: readonly SalonFontOption[] = SALON_FONT_OPTIONS.filter((f) => f.featured);

export interface SalonTemplateOption {
  key: SalonSiteTemplate;
  label: string;
  description: string;
}

/** Gabarits d'entête (maquette KAN-16 : la différence est l'entête, le reste est commun). */
export const SALON_TEMPLATES: readonly SalonTemplateOption[] = [
  { key: "CLASSIC", label: "Carrousel", description: "Vos réalisations défilent en haut, puis votre nom centré." },
  { key: "BANNER", label: "Bannière", description: "Une photo du salon en bandeau, puis votre nom centré." },
  { key: "COMPACT", label: "Compact", description: "Logo et nom en ligne, puis un carrousel arrondi." },
];

export interface SalonColorThemeOption {
  key: SalonSiteColorTheme;
  label: string;
  description: string;
}

export const SALON_COLOR_THEMES: readonly SalonColorThemeOption[] = [
  { key: "MONO", label: "Noir & blanc", description: "Noir, blanc, gris. Sobre et intemporel." },
  { key: "KORI", label: "Korí", description: "Vert sauge et beige. Naturel et doux." },
  { key: "ROSY", label: "Rosy", description: "Rose vif, blanc et noir. Féminin et affirmé." },
  { key: "CUSTOM", label: "Personnalisé", description: "Choisissez votre accent et votre fond." },
];

/** Palettes prédéfinies, valeurs relevées sur la maquette (page de réservation kori). */
export const SALON_PRESET_PALETTES: Record<Exclude<SalonSiteColorTheme, "CUSTOM">, SalonPalette> = {
  MONO: {
    bg: "#FFFFFF",
    fg: "#111111",
    fg2: "#3A3A3A",
    muted: "#5E5E5E",
    surface: "#F5F5F5",
    surface2: "#F7F7F7",
    border: "#E8E8E8",
    borderStrong: "#CFCFCF",
    chipBorder: "#DCDCDC",
    accent: "#111111",
    onAccent: "#FFFFFF",
    accentSoft: "#ECECEC",
    media: "#E6E6E6",
    star: "#111111",
  },
  KORI: {
    bg: "#FFFFFF",
    fg: "#2A3731",
    fg2: "#3D4A43",
    muted: "#56635B",
    surface: "#F7F1E8",
    surface2: "#FAF6F0",
    border: "#E8E2D6",
    borderStrong: "#D3CCBE",
    chipBorder: "#DDD6C8",
    accent: "#53745D",
    onAccent: "#FFFFFF",
    accentSoft: "#E6ECE4",
    media: "#DCE5DB",
    star: "#D9A441",
  },
  ROSY: {
    bg: "#FFFFFF",
    fg: "#111111",
    fg2: "#3A3A3A",
    muted: "#5E5E5E",
    surface: "#FCEEF3",
    surface2: "#FDF5F8",
    border: "#ECE6E8",
    borderStrong: "#E0D8DB",
    chipBorder: "#E0D8DB",
    accent: "#C2185B",
    onAccent: "#FFFFFF",
    accentSoft: "#F6E3EA",
    media: "#F3DCE5",
    star: "#D9A441",
  },
};

/** Couleurs proposées dans l'éditeur pour le thème personnalisé (saisie libre possible). */
export const CUSTOM_ACCENT_PRESETS = ["#111111", "#53745D", "#C2185B", "#7A3E48", "#1F3A5F", "#5B3E8C", "#B4552D", "#0F766E"] as const;
export const CUSTOM_SURFACE_PRESETS = ["#F5F5F5", "#F7F1E8", "#FCEEF3", "#F3F0FA", "#EEF4F6", "#FBF3E4", "#F1F5EE", "#FFFFFF"] as const;

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
  return contrastRatio(hex, "#FFFFFF") >= contrastRatio(hex, "#111111") ? "#FFFFFF" : "#111111";
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

/**
 * Palette dérivée de deux couleurs libres : `accent` (actions) et `surface`
 * (fond doux). Le texte reste neutre et sombre pour garantir la lisibilité ;
 * bordures et teintes sont calculées à partir de la surface et de l'accent.
 */
export function buildCustomPalette(accent: string, surface: string): SalonPalette {
  const base = SALON_PRESET_PALETTES.MONO;
  return {
    ...base,
    surface,
    surface2: mixHex(surface, "#FFFFFF", 0.45),
    border: mixHex(surface, "#000000", 0.07),
    borderStrong: mixHex(surface, "#000000", 0.18),
    chipBorder: mixHex(surface, "#000000", 0.12),
    accent,
    onAccent: onColor(accent),
    accentSoft: mixHex(accent, "#FFFFFF", 0.86),
    media: mixHex(surface, "#000000", 0.08),
    star: accent,
  };
}

export function isFontKey(value: unknown): value is SalonSiteFontKey {
  return SALON_FONT_OPTIONS.some((f) => f.key === value);
}

export function isTemplateKey(value: unknown): value is SalonSiteTemplate {
  return SALON_TEMPLATES.some((t) => t.key === value);
}

export function isColorThemeKey(value: unknown): value is SalonSiteColorTheme {
  return SALON_COLOR_THEMES.some((t) => t.key === value);
}

/** Palette d'un thème : prédéfinie, ou calculée pour `CUSTOM`. */
export function resolvePalette(colorTheme: SalonSiteColorTheme, primaryColor: string, secondaryColor: string): SalonPalette {
  if (colorTheme === "CUSTOM") return buildCustomPalette(primaryColor, secondaryColor);
  return SALON_PRESET_PALETTES[colorTheme];
}

/** Thème par défaut : gabarit carrousel, noir-blanc-gris, titres Bricolage Grotesque. */
export const DEFAULT_SALON_THEME: SalonTheme = {
  template: "CLASSIC",
  colorTheme: "MONO",
  primaryColor: "#111111",
  secondaryColor: "#F5F5F5",
  palette: SALON_PRESET_PALETTES.MONO,
  font: "BRICOLAGE",
  showLogo: true,
  logoUrl: null,
  tagline: null,
  isCustomized: false,
};

/** Construit un thème complet depuis la donnée API (tolérant aux valeurs invalides). */
export function resolveSalonTheme(site: SalonSiteDto | null | undefined): SalonTheme {
  if (!site) return DEFAULT_SALON_THEME;
  const colorTheme = isColorThemeKey(site.colorTheme) ? site.colorTheme : DEFAULT_SALON_THEME.colorTheme;
  const primaryColor = normalizeHex(site.primaryColor) ?? DEFAULT_SALON_THEME.primaryColor;
  const secondaryColor = normalizeHex(site.secondaryColor) ?? DEFAULT_SALON_THEME.secondaryColor;
  return {
    template: isTemplateKey(site.template) ? site.template : DEFAULT_SALON_THEME.template,
    colorTheme,
    primaryColor,
    secondaryColor,
    palette: resolvePalette(colorTheme, primaryColor, secondaryColor),
    font: isFontKey(site.font) ? site.font : DEFAULT_SALON_THEME.font,
    showLogo: site.showLogo !== false,
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

/**
 * Variables CSS consommées par les sections et le parcours de réservation
 * (`var(--site-accent)`, classes Tailwind `bg-site-accent`, `text-site-fg`…).
 * Les familles de polices sont déclaratives ici ; `SalonThemeProvider` les
 * remplace par celles réellement chargées par `next/font`.
 */
export function themeToCssVars(theme: SalonTheme): Record<string, string> {
  const font = getFontOption(theme.font);
  const p = theme.palette;
  return {
    "--site-bg": p.bg,
    "--site-fg": p.fg,
    "--site-fg-2": p.fg2,
    "--site-muted": p.muted,
    "--site-surface": p.surface,
    "--site-surface-2": p.surface2,
    "--site-border": p.border,
    "--site-border-strong": p.borderStrong,
    "--site-chip-border": p.chipBorder,
    "--site-accent": p.accent,
    "--site-on-accent": p.onAccent,
    "--site-accent-soft": p.accentSoft,
    "--site-media": p.media,
    "--site-star": p.star,
    "--site-font-display": font.family,
    "--site-font-body": font.bodyFamily,
    "--site-display-transform": font.uppercase ? "uppercase" : "none",
    "--site-display-scale": font.uppercase ? "0.9" : "1",
  };
}
