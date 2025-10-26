/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Récupérer les paramètres dynamiques
    const title = searchParams.get("title") || "Kori";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    // Charger la police
    // const fontData = await fetch(
    //   new URL("../../assets/Inter-Bold.ttf", import.meta.url)
    // ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f2f2f2",
            backgroundImage:
              "linear-gradient(to bottom right, #ffffff, #f2f2f2)",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
            }}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
              width="120"
              height="120"
              style={{ margin: "0 10px" }}
              alt="Kori Logo"
            />
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 60,
              fontWeight: "bold",
              letterSpacing: "-0.025em",
              color: "#1f2937",
              marginBottom: "20px",
              padding: "0 120px",
              textAlign: "center",
            }}
          >
            {title}
          </div>
          {from && to && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 40,
                color: "#4b5563",
              }}
            >
              <span style={{ color: "#2563eb" }}>{from}</span>
              <span style={{ margin: "0 20px" }}>→</span>
              <span style={{ color: "#16a34a" }}>{to}</span>
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
        // fonts: [
        //   {
        //     name: "Inter",
        //     data: fontData,
        //     style: "normal",
        //     weight: 700,
        //   },
        // ],
      }
    );
  } catch (e: any) {
    return new Response(`Erreur de génération d'image OG: ${e.message}`, {
      status: 500,
    });
  }
}
