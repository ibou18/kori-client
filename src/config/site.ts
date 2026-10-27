/**
 * Configuration du site public (SEO, partage social, données structurées).
 * L'URL canonique vise toujours le domaine de production, y compris sur les
 * previews, pour éviter que Google indexe des URL de preview.
 */
export const siteConfig = {
  name: "korí",
  legalName: "Kori Beauty",
  title: "korí · Réservation beauté en ligne, gratuite pour les pros",
  description:
    "Réservez coiffure, tresses, barbier, manucure et soins en 2 minutes avec korí. Pour les professionnels de la beauté : agenda, rappels et acomptes, sans abonnement.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://www.koribeauty.com").replace(/\/$/, ""),
  locale: "fr_CA",
  email: "support@koribeauty.com",
  keywords: [
    "réservation coiffure",
    "réservation beauté en ligne",
    "coiffeuse tresses",
    "barbier",
    "manucure",
    "salon de coiffure",
    "prise de rendez-vous salon",
    "logiciel de réservation salon gratuit",
    "agenda coiffeuse",
    "Canada",
    "Québec",
  ],
  appStoreId: "6754260244",
  appStoreUrl: "https://apps.apple.com/app/kori/id6754260244",
  googlePlayUrl:
    "https://play.google.com/store/apps/details?id=com.laguidev.kori",
};

/** URL absolue à partir d'un chemin (« /fr/inscription »). */
export const absoluteUrl = (path = "/") =>
  `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;

/** Image de partage par défaut (générée par src/app/opengraph-image.tsx). */
export const defaultOgImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "korí · Réservation beauté en ligne, gratuite pour les pros",
};

type OpenGraphInput = {
  title: string;
  description: string;
  url: string;
  images?: { url: string; width?: number; height?: number; alt?: string }[];
};

/**
 * Open Graph complet pour une page. Next remplace l'objet openGraph du layout
 * au lieu de le fusionner : chaque page doit donc fournir tous les champs.
 */
export const buildOpenGraph = ({ images, ...rest }: OpenGraphInput) => ({
  type: "website" as const,
  siteName: siteConfig.name,
  locale: siteConfig.locale,
  images: images ?? [defaultOgImage],
  ...rest,
});

/** Carte Twitter / X correspondante. */
export const buildTwitter = ({
  title,
  description,
  image = defaultOgImage.url,
}: {
  title: string;
  description: string;
  image?: string;
}) => ({
  card: "summary_large_image" as const,
  title,
  description,
  images: [image],
});
