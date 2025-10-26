"use client";

import { useLocaleContext } from "@/lib/LocaleProvider";
import { useRouter, usePathname } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GlobeIcon } from "lucide-react";

export default function LanguageToggle() {
  const { locale, setLocale } = useLocaleContext();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = (checked: boolean) => {
    const newLocale = checked ? "fr" : "en";
    const pathWithoutLocale = pathname.replace(/^\/(en|fr)/, "");
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    setLocale(newLocale);
    router.replace(newPath);
    router.refresh();
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center">
        <GlobeIcon className="h-4 w-4 mr-2 text-muted-foreground" />
        <span
          className={locale === "en" ? "font-medium" : "text-muted-foreground"}
        >
          EN
        </span>
      </div>
      <Switch
        checked={locale === "fr"}
        onChange={toggleLocale}
        className="data-[state=checked]:bg-teal-600"
      />
      <span
        className={locale === "fr" ? "font-medium" : "text-muted-foreground"}
      >
        FR
      </span>
    </div>
  );
}
