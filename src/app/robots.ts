import { siteConfig } from "@/config/site";
import type { MetadataRoute } from "next";

/** robots.txt : pages publiques indexables, espaces privés exclus. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/*/admin",
          "/*/auth/",
          "/*/mes-rendez-vous",
          "/*/dashboard",
          "/*/invite-owner",
          "/*/invite-employee",
          "/*/verify-email",
          "/*/salon/*/booking-success",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
