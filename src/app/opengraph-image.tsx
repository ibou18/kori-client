import { siteConfig } from "@/config/site";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "korí · Réservation beauté en ligne, gratuite pour les pros";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image de partage (Open Graph / Twitter) générée au build. */
export default async function OpengraphImage() {
  // Police par défaut d'ImageResponse : src/assets/Inter-Bold.ttf n'est pas
  // une vraie police (fichier HTML), il ne peut pas être chargé.
  const icon = await readFile(join(process.cwd(), "src/app/icon.png"));
  const iconSrc = `data:image/png;base64,${icon.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#2A3731",
          backgroundImage:
            "radial-gradient(circle at 0% 0%, #53745D 0%, #2A3731 55%)",
          color: "white",
          fontWeight: 700,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 88,
              height: 88,
              borderRadius: 24,
              background: "#F7F1E8",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={iconSrc} width={72} height={72} alt="" />
          </div>
          <span style={{ fontSize: 56, letterSpacing: -1 }}>korí</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            Votre prochain rendez-vous beauté se réserve en 2 minutes.
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <span
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                background: "#D9A441",
                color: "#2A3731",
                fontSize: 28,
              }}
            >
              0 $ pour les professionnels
            </span>
            <span
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                border: "2px solid rgba(255,255,255,0.3)",
                fontSize: 28,
              }}
            >
              {siteConfig.url.replace(/^https?:\/\//, "")}
            </span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
