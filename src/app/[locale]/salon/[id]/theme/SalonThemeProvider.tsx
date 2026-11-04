"use client";

import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from "react";
import { SALON_BODY_FONT_FAMILY, SALON_FONT_FAMILIES } from "./fonts";
import {
  DEFAULT_SALON_THEME,
  getFontOption,
  themeToCssVars,
  type SalonTheme,
} from "./salonTheme";

const SalonThemeContext = createContext<SalonTheme>(DEFAULT_SALON_THEME);

export function useSalonTheme(): SalonTheme {
  return useContext(SalonThemeContext);
}

/**
 * Pose le thème du salon en CSS variables sur un wrapper. Les sections lisent
 * `var(--site-primary)` etc. (classes Tailwind `bg-site-primary`, `text-site-on-primary`…).
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
    const vars = themeToCssVars(theme) as Record<string, string>;
    // Remplace la famille déclarative par la famille réellement chargée par next/font.
    vars["--site-font-display"] = SALON_FONT_FAMILIES[theme.font];
    vars["--site-font-body"] = SALON_BODY_FONT_FAMILY;
    vars["--site-display-transform"] = getFontOption(theme.font).uppercase ? "uppercase" : "none";
    vars["--site-display-scale"] = getFontOption(theme.font).uppercase ? "0.9" : "1";
    return { ...vars, fontFamily: "var(--site-font-body)" } as CSSProperties;
  }, [theme]);

  return (
    <SalonThemeContext.Provider value={theme}>
      <div data-salon-theme={theme.template} style={style} className={className}>
        {children}
      </div>
    </SalonThemeContext.Provider>
  );
}
