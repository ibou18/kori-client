import { describe, expect, it } from "vitest";
import {
  buildCustomDarkPalette,
  buildCustomPalette,
  contrastRatio,
  DEFAULT_SALON_THEME,
  FEATURED_FONT_OPTIONS,
  normalizeHex,
  onColor,
  resolveColorMode,
  resolveSalonTheme,
  SALON_COLOR_THEMES,
  SALON_PRESET_DARK_PALETTES,
  SALON_PRESET_PALETTES,
  SALON_TEMPLATES,
  salonInitials,
  themeToCssVars,
  withColorMode,
} from "./salonTheme";

describe("resolveSalonTheme", () => {
  it("renvoie le thème par défaut (carrousel, noir-blanc-gris, Bricolage) sans ligne salon_sites", () => {
    const theme = resolveSalonTheme(null);
    expect(theme).toBe(DEFAULT_SALON_THEME);
    expect(theme.template).toBe("CLASSIC");
    expect(theme.colorTheme).toBe("MONO");
    expect(theme.font).toBe("BRICOLAGE");
    expect(theme.showLogo).toBe(false);
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

describe("apparence claire / sombre", () => {
  const presets = ["MONO", "KORI", "ROSY"] as const;

  it("reste en clair par défaut et pour une valeur inconnue", () => {
    expect(resolveSalonTheme(null).mode).toBe("light");
    const theme = resolveSalonTheme({ colorTheme: "KORI", appearance: "NEON" });
    expect(theme.appearance).toBe("LIGHT");
    expect(theme.mode).toBe("light");
    expect(theme.palette).toEqual(SALON_PRESET_PALETTES.KORI);
  });

  it("affiche la palette sombre du thème en DARK", () => {
    const theme = resolveSalonTheme({ colorTheme: "ROSY", appearance: "DARK" });
    expect(theme.mode).toBe("dark");
    expect(theme.palette).toEqual(SALON_PRESET_DARK_PALETTES.ROSY);
    expect(theme.lightPalette).toEqual(SALON_PRESET_PALETTES.ROSY);
  });

  it("AUTO suit l'appareil : clair au rendu serveur, sombre si l'appareil le demande", () => {
    expect(resolveColorMode("AUTO")).toBe("light");
    expect(resolveColorMode("AUTO", true)).toBe("dark");
    expect(resolveColorMode("LIGHT", true)).toBe("light");
    const theme = resolveSalonTheme({ colorTheme: "MONO", appearance: "AUTO" });
    expect(theme.mode).toBe("light");
    const dark = withColorMode(theme, "dark");
    expect(dark.palette).toEqual(SALON_PRESET_DARK_PALETTES.MONO);
    expect(withColorMode(dark, "dark")).toBe(dark);
  });

  it.each(presets)("palette sombre %s lisible (texte, atténué, accent)", (key) => {
    const p = SALON_PRESET_DARK_PALETTES[key];
    expect(contrastRatio(p.fg, p.bg)).toBeGreaterThanOrEqual(7);
    expect(contrastRatio(p.muted, p.bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.onAccent, p.accent)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.accent, p.bg)).toBeGreaterThanOrEqual(3);
  });

  it.each([
    ["LIGHT", SALON_PRESET_PALETTES.MONO],
    ["DARK", SALON_PRESET_DARK_PALETTES.MONO],
  ] as const)("messages d'état lisibles en %s", (_, p) => {
    expect(contrastRatio(p.danger, p.dangerBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.warning, p.warningBg)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(p.success, p.successBg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(["#111111", "#53745D", "#C2185B", "#1F3A5F", "#5B3E8C", "#FFD400"])(
    "personnalisé sombre : accent %s éclairci jusqu'à rester lisible",
    (accent) => {
      const p = buildCustomDarkPalette(accent);
      expect(contrastRatio(p.fg, p.bg)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(p.accent, p.bg)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.onAccent, p.accent)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it("expose les teintes d'état en variables CSS", () => {
    const vars = themeToCssVars(resolveSalonTheme({ appearance: "DARK" }));
    expect(vars["--site-bg"]).toBe(SALON_PRESET_DARK_PALETTES.MONO.bg);
    expect(vars["--site-danger"]).toBe(SALON_PRESET_DARK_PALETTES.MONO.danger);
  });
});
