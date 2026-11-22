"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { salonInitials } from "../theme/salonTheme";
import { useSalonTheme } from "../theme/SalonThemeProvider";

/**
 * Logo du salon (image carrée importée par la prestataire) ou, à défaut, son
 * monogramme sur fond accent. Rond, comme sur la maquette.
 */
export function SalonAvatar({
  name,
  size = 68,
  ring = true,
  className,
}: {
  name: string;
  /** Diamètre en pixels. */
  size?: number;
  /** Bordure claire + ombre, pour chevaucher une photo. */
  ring?: boolean;
  className?: string;
}) {
  const theme = useSalonTheme();
  const initials = salonInitials(name) || "?";
  return (
    <div
      aria-hidden
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-site-accent text-site-on-accent",
        ring && "border-4 border-site-bg shadow-[0_6px_18px_rgba(17,17,17,0.15)]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {theme.logoUrl ? (
        <Image
          src={theme.logoUrl}
          alt={`Logo ${name}`}
          width={size}
          height={size}
          className="size-full object-cover"
        />
      ) : (
        <span
          className="font-site-display font-bold leading-none"
          style={{ fontSize: Math.round(size * 0.42) }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
