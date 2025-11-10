"use client";

import {
  Scissors,
  Sparkles,
  Heart,
  Droplets,
  FlaskConical,
  Star,
  User,
  Smile,
  Hand,
  Footprints,
  Palette,
  Store,
  Sparkles as SpaIcon,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";

interface CategoryIconProps {
  iconName?: string | null;
  className?: string;
  size?: number;
}

// Mapping des noms d'icônes vers les composants Lucide React
const iconMap: Record<string, LucideIcon> = {
  // Catégories coiffeurs
  braids: Scissors,
  "braids-icon": Scissors,
  locs: Sparkles,
  installation: Hand,
  care: Heart,
  "care-icon": Heart,
  chemical: FlaskConical,
  special: Star,
  // Catégories barbiers
  "men-haircut-icon": User,
  "beard-icon": Smile,
  "face-care-icon": Smile,
  // Catégories manucures
  "manicure-icon": Hand,
  "pedicure-icon": Footprints,
  "nail-art-icon": Palette,
  // Icônes génériques
  scissors: Scissors,
  heart: Heart,
  star: Star,
  user: User,
  hand: Hand,
  face: Smile,
  smile: Smile,
  palette: Palette,
  footprints: Footprints,
  droplets: Droplets,
  flask: FlaskConical,
  sparkles: Sparkles,
};

export function CategoryIcon({
  iconName,
  className = "",
  size = 24,
}: CategoryIconProps) {
  const IconComponent = useMemo(() => {
    if (!iconName) return null;
    return iconMap[iconName.toLowerCase()] || null;
  }, [iconName]);

  if (!IconComponent) {
    // Fallback: retourner une icône par défaut si l'icône n'est pas trouvée
    return <Scissors className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
}

// Composant pour les icônes de type de salon
const salonTypeIconMap: Record<string, LucideIcon> = {
  HAIRDRESSER: Scissors,
  BARBER: User,
  NAIL_SALON: Hand,
  SPA: SpaIcon,
  BEAUTY: Star,
};

interface SalonTypeIconProps {
  salonType: string;
  className?: string;
  size?: number;
}

export function SalonTypeIcon({
  salonType,
  className = "",
  size = 24,
}: SalonTypeIconProps) {
  const IconComponent = useMemo(() => {
    return salonTypeIconMap[salonType] || Store;
  }, [salonType]);

  return <IconComponent className={className} size={size} />;
}

