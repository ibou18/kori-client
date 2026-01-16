import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get("input");

    if (!input || input.trim().length < 2) {
      return NextResponse.json(
        { error: "Input trop court" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("❌ Google API Key non configurée");
      return NextResponse.json(
        { error: "Configuration API manquante" },
        { status: 500 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json`;
    const params = new URLSearchParams({
      input: input.trim(),
      key: apiKey,
      language: "fr",
      region: "ca", // Prioriser les résultats canadiens
      components: "country:ca|country:fr|country:us", // Canada, France, USA
      types: "address", // Limiter aux adresses
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.status === "OK" && data.predictions) {
      return NextResponse.json({
        success: true,
        predictions: data.predictions,
      });
    } else {
      return NextResponse.json({
        success: false,
        predictions: [],
        error: data.error_message || data.status,
      });
    }
  } catch (error: any) {
    console.error("❌ Erreur recherche adresses:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la recherche d'adresses",
      },
      { status: 500 }
    );
  }
}

