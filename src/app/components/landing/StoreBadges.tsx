"use client";

import Image from "next/image";
import android from "@/assets/photos/android.png";
import apple from "@/assets/photos/apple.png";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "./constants";
import { cn } from "@/lib/utils";

interface StoreBadgesProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/** Badges App Store / Google Play avec léger effet au survol. */
export function StoreBadges({ className, size = "md" }: StoreBadgesProps) {
  const height =
    size === "lg" ? "h-14 sm:h-16" : size === "sm" ? "h-10" : "h-12 sm:h-14";
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Télécharger korí sur l'App Store"
        className="transition-transform duration-300 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95"
      >
        <Image
          src={apple}
          alt="App Store"
          width={200}
          height={70}
          className={cn("w-auto object-contain", height)}
        />
      </a>
      <a
        href={GOOGLE_PLAY_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Télécharger korí sur Google Play"
        className="transition-transform duration-300 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95"
      >
        <Image
          src={android}
          alt="Google Play"
          width={220}
          height={70}
          className={cn("w-auto object-contain", height)}
        />
      </a>
    </div>
  );
}
