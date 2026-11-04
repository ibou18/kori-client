"use client";

import type { ReactNode } from "react";
import { useSalonTheme } from "../theme/SalonThemeProvider";

/** En-tête de section du mini-site : surtitre couleur marque + titre en police du salon. */
export function SalonSectionHeading({
  eyebrow,
  title,
  aside,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  aside?: ReactNode;
  align?: "left" | "center";
}) {
  const theme = useSalonTheme();
  return (
    <div
      className={`mb-5 flex flex-wrap items-end gap-3 ${
        align === "center" ? "justify-center text-center" : "justify-between"
      }`}
    >
      <div>
        {eyebrow && (
          <p
            className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: theme.primaryColor }}
          >
            {eyebrow}
          </p>
        )}
        <h2
          className="font-site-display text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          style={{ textTransform: "var(--site-display-transform)" as never }}
        >
          {title}
        </h2>
      </div>
      {aside && <div className="text-sm text-slate-500">{aside}</div>}
    </div>
  );
}
