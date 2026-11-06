"use client";

import { useEffect, useState } from "react";
import { useSalonTheme } from "../theme/SalonThemeProvider";

export interface SalonNavItem {
  id: string;
  label: string;
}

/** Sous-navigation collante : surligne la section visible, défile en douceur. */
export function SalonSectionNav({ items }: { items: SalonNavItem[] }) {
  const theme = useSalonTheme();
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observers = items
      .map((item) => {
        const el = document.getElementById(item.id);
        if (!el) return null;
        const obs = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) setActive(item.id);
            });
          },
          { rootMargin: "-40% 0px -55% 0px" },
        );
        obs.observe(el);
        return obs;
      })
      .filter(Boolean) as IntersectionObserver[];
    return () => observers.forEach((o) => o.disconnect());
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Sections"
      className="sticky top-14 z-30 -mx-4 border-b border-black/[0.07] bg-white/85 backdrop-blur lg:-mx-8"
    >
      <div className="scrollbar-hide mx-auto flex h-11 max-w-5xl items-center gap-1 overflow-x-auto px-4 sm:px-8">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(item.id)
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
                setActive(item.id);
              }}
              className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
              style={
                isActive
                  ? { color: theme.primaryColor, background: `${theme.primaryColor}1F` }
                  : { color: "#5f6a63" }
              }
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
