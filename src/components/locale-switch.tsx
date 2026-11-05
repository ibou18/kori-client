"use client";

import { useLocaleContext } from "@/lib/LocaleProvider";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

/** Sélecteur de langue compact (FR | EN), partagé par le header public et le back-office. */
export function LocaleSwitch({ className }: { className?: string }) {
  const { locale, setLocale } = useLocaleContext();
  const router = useRouter();
  const pathname = usePathname() ?? "";

  const switchTo = (next: string) => {
    if (next === locale) return;
    const rest = pathname.replace(/^\/(en|fr)(?=\/|$)/, "");
    setLocale(next);
    router.replace(`/${next}${rest}`);
    router.refresh();
  };

  return (
    <div
      role="group"
      aria-label="Langue"
      className={cn(
        "flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold",
        className,
      )}
    >
      {["fr", "en"].map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchTo(code)}
          aria-pressed={locale === code}
          className={cn(
            "rounded-full px-2.5 py-1 uppercase transition-colors",
            locale === code
              ? "bg-white text-[#3a5a47] shadow-sm"
              : "text-slate-400 hover:text-slate-600",
          )}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
