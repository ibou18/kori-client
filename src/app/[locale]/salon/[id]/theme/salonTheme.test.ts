import { describe, expect, it } from "vitest";
import {
  buildCustomPalette,
  contrastRatio,
  DEFAULT_SALON_THEME,
  FEATURED_FONT_OPTIONS,
  normalizeHex,
  onColor,
  resolveSalonTheme,
  SALON_COLOR_THEMES,
  SALON_PRESET_PALETTES,
  SALON_TEMPLATES,
  salonInitials,
  themeToCssVars,
} from "./salonTheme";

describe("resolveSalonTheme", () => {
  it("renvoie le thème par défaut (carrousel, noir-blanc-gris, Bricolage) sans ligne salon_sites", () => {
    const theme = resolveSalonTheme(null);
    expect(theme).toBe(DEFAULT_SALON_THEME);
    expect(theme.template).toBe("CLASSIC");
    expect(theme.colorTheme).toBe("MONO");
    expect(theme.font).toBe("BRICOLAGE");
    expect(theme.showLogo).toBe(true);
    expect(theme.palette).toEqual(SALON_PRESET_PALETTES.MONO);
  });

  it("applique un thème prédéfini et ignore les couleurs libres", () => {
    const theme = resolveSalonTheme({
      template: "BANNER",
      colorTheme: "KORI",
      primaryColor: "#FF0000",
      secondaryColor: "#00FF00",
      font: "PLAYFAIR",
      showLogo: false,
    });
    expect(theme.template).toBe("BANNER");
    expect(theme.palette).toEqual(SALON_PRESET_PALETTES.KORI);
    expect(theme.palette.accent).toBe("#53745D");
    expect(theme.showLogo).toBe(false);
    expect(theme.font).toBe("PLAYFAIR");
    expect(theme.isCustomized).toBe(true);
  });

  it("dérive la palette CUSTOM depuis l'accent et le fond doux", () => {
    const theme = resolveSalonTheme({ colorTheme: "CUSTOM", primaryColor: "1f3a5f", secondaryColor: "#EEF4F6" });
    expect(theme.primaryColor).toBe("#1F3A5F");
    expect(theme.palette.accent).toBe("#1F3A5F");
    expect(theme.palette.onAccent).toBe("#FFFFFF");
    expect(theme.palette.surface).toBe("#EEF4F6");
    expect(theme.palette.star).toBe("#1F3A5F");
  });

  it("retombe sur les valeurs par défaut pour toute valeur inconnue", () => {
    const theme = resolveSalonTheme({ template: "BOLD", colorTheme: "NEON", font: "COMIC", primaryColor: "rouge" });
    expect(theme.template).toBe("CLASSIC");
    expect(theme.colorTheme).toBe("MONO");
    expect(theme.font).toBe("BRICOLAGE");
    expect(theme.primaryColor).toBe(DEFAULT_SALON_THEME.primaryColor);
  });

  it("garde les polices historiques (P1) valides", () => {
    expect(resolveSalonTheme({ font: "FRAUNCES" }).font).toBe("FRAUNCES");
  });
});

describe("palettes et contraste", () => {
  it("expose trois gabarits, quatre thèmes et trois paires de polices", () => {
    expect(SALON_TEMPLATES.map((t) => t.key)).toEqual(["CLASSIC", "BANNER", "COMPACT"]);
    expect(SALON_COLOR_THEMES.map((t) => t.key)).toEqual(["MONO", "KORI", "ROSY", "CUSTOM"]);
    expect(FEATURED_FONT_OPTIONS.map((f) => f.key)).toEqual(["BRICOLAGE", "PLAYFAIR", "DM_SANS"]);
  });

  it("chaque palette prédéfinie garde un texte lisible et un CTA lisible", () => {
    for (const palette of Object.values(SALON_PRESET_PALETTES)) {
      expect(contrastRatio(palette.fg, palette.bg)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(palette.fg, palette.surface)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(palette.onAccent, palette.accent)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("choisit un texte noir sur un accent clair", () => {
    const palette = buildCustomPalette("#F2C14E", "#FFFFFF");
    expect(palette.onAccent).toBe("#111111");
    expect(onColor("#111111")).toBe("#FFFFFF");
  });

  it("normalise les hex avec ou sans dièse", () => {
    expect(normalizeHex("abcdef")).toBe("#ABCDEF");
    expect(normalizeHex(" #A1B2C3 ")).toBe("#A1B2C3");
    expect(normalizeHex("#abc")).toBeNull();
    expect(normalizeHex(undefined)).toBeNull();
  });
});

describe("themeToCssVars", () => {
  it("pose toutes les variables consommées par les sections", () => {
    const vars = themeToCssVars(DEFAULT_SALON_THEME);
    expect(vars["--site-accent"]).toBe("#111111");
    expect(vars["--site-surface"]).toBe("#F5F5F5");
    expect(vars["--site-on-accent"]).toBe("#FFFFFF");
    expect(vars["--site-font-display"]).toContain("Bricolage Grotesque");
    expect(vars["--site-font-body"]).toContain("Inter");
    expect(vars["--site-display-transform"]).toBe("none");
  });
});

describe("salonInitials", () => {
  it("ignore les articles et garde deux lettres au plus", () => {
    expect(salonInitials("L'Atelier de Nova")).toBe("AN");
    expect(salonInitials("Aïcha Diallo")).toBe("AD");
    expect(salonInitials("Nova")).toBe("N");
    expect(salonInitials("")).toBe("");
  });
});
