import { siteConfig } from "@/config/site";
import type { MetadataRoute } from "next";

/** Pages publiques statiques (contenu en français, préfixe /fr). */
const PUBLIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/fr", priority: 1, changeFrequency: "weekly" },
  { path: "/fr/inscription", priority: 0.9, changeFrequency: "monthly" },
  { path: "/fr/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/fr/support", priority: 0.5, changeFrequency: "monthly" },
  { path: "/fr/terms/cgu-pro", priority: 0.3, changeFrequency: "yearly" },
  { path: "/fr/terms/cgu-client", priority: 0.3, changeFrequency: "yearly" },
  { path: "/fr/terms/cgv", priority: 0.3, changeFrequency: "yearly" },
  { path: "/fr/terms/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
  {
    path: "/fr/terms/cancellation-policy",
    priority: 0.3,
    changeFrequency: "yearly",
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PUBLIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: `${siteConfig.url}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
