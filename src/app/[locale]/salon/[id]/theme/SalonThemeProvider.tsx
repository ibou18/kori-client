"use client";

import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from "react";
import { SALON_BODY_FONT_FAMILIES, SALON_FONT_FAMILIES } from "./fonts";
import { DEFAULT_SALON_THEME, themeToCssVars, type SalonTheme } from "./salonTheme";

const SalonThemeContext = createContext<SalonTheme>(DEFAULT_SALON_THEME);

export function useSalonTheme(): SalonTheme {
  return useContext(SalonThemeContext);
}

/**
 * Pose le thème du salon en CSS variables sur un wrapper. Les sections et le
 * parcours de réservation lisent `var(--site-accent)`, `var(--site-surface)`…
 * (classes Tailwind `bg-site-accent`, `text-site-fg`, `border-site-border`…).
 *
 * Le wrapper applique aussi le fond, la couleur de texte et la police du corps,
 * de sorte qu'un composant non thémé hérite déjà d'un rendu cohérent.
 */
export function SalonThemeProvider({
  theme,
  children,
  className,
}: {
  theme: SalonTheme;
  children: ReactNode;
  className?: string;
}) {
  const style = useMemo(() => {
    const vars = themeToCssVars(theme);
    // Remplace les familles déclaratives par celles réellement chargées par next/font.
    vars["--site-font-display"] = SALON_FONT_FAMILIES[theme.font];
    vars["--site-font-body"] = SALON_BODY_FONT_FAMILIES[theme.font];
    return {
      ...vars,
      fontFamily: "var(--site-font-body)",
      background: "var(--site-bg)",
      color: "var(--site-fg)",
    } as CSSProperties;
  }, [theme]);

  return (
    <SalonThemeContext.Provider value={theme}>
      <div
        data-salon-theme={theme.template}
        data-salon-color-theme={theme.colorTheme}
        style={style}
        className={className}
      >
        {children}
      </div>
    </SalonThemeContext.Provider>
  );
}
