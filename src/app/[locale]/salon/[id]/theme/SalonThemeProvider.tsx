"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { SALON_BODY_FONT_FAMILIES, SALON_FONT_FAMILIES } from "./fonts";
import { DEFAULT_SALON_THEME, resolveColorMode, themeToCssVars, withColorMode, type SalonTheme } from "./salonTheme";

const SalonThemeContext = createContext<SalonTheme>(DEFAULT_SALON_THEME);

export function useSalonTheme(): SalonTheme {
  return useContext(SalonThemeContext);
}

const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribePrefersDark(onChange: () => void) {
  const mql = window.matchMedia(DARK_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/** Réglage clair/sombre de l'appareil ; `false` au rendu serveur. */
function usePrefersDark(): boolean {
  return useSyncExternalStore(
    subscribePrefersDark,
    () => window.matchMedia(DARK_QUERY).matches,
    () => false,
  );
}

// useLayoutEffect côté navigateur (pas de flash), useEffect au rendu serveur (React 18 avertit sinon).
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Pose le thème du salon en CSS variables sur un wrapper. Les sections et le
 * parcours de réservation lisent `var(--site-accent)`, `var(--site-surface)`…
 * (classes Tailwind `bg-site-accent`, `text-site-fg`, `border-site-border`…).
 *
 * Le wrapper applique aussi le fond, la couleur de texte et la police du corps,
 * de sorte qu'un composant non thémé hérite déjà d'un rendu cohérent.
 *
 * Apparence : `AUTO` est résolu ici d'après `prefers-color-scheme` (et suit ses
 * changements). Les mêmes variables sont recopiées sur `<html>` tant que la page
 * est montée : les fenêtres rendues en portail (calendrier, dialogues, listes
 * d'adresses) et le `<main>` qui entoure la page suivent ainsi le thème.
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
  const prefersDark = usePrefersDark();
  const effective = useMemo(
    () => withColorMode(theme, resolveColorMode(theme.appearance, prefersDark)),
    [theme, prefersDark],
  );

  const vars = useMemo(() => {
    const v = themeToCssVars(effective);
    // Remplace les familles déclaratives par celles réellement chargées par next/font.
    v["--site-font-display"] = SALON_FONT_FAMILIES[effective.font];
    v["--site-font-body"] = SALON_BODY_FONT_FAMILIES[effective.font];
    return v;
  }, [effective]);

  const style = useMemo(
    () =>
      ({
        ...vars,
        fontFamily: "var(--site-font-body)",
        background: "var(--site-bg)",
        color: "var(--site-fg)",
        colorScheme: effective.mode,
      }) as CSSProperties,
    [vars, effective.mode],
  );

  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value);
    root.dataset.salonMode = effective.mode;
    return () => {
      for (const name of Object.keys(vars)) root.style.removeProperty(name);
      delete root.dataset.salonMode;
    };
  }, [vars, effective.mode]);

  return (
    <SalonThemeContext.Provider value={effective}>
      <div
        data-salon-theme={effective.template}
        data-salon-color-theme={effective.colorTheme}
        data-salon-mode={effective.mode}
        style={style}
        className={className}
      >
        {children}
      </div>
    </SalonThemeContext.Provider>
  );
}
