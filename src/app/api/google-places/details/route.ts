import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const placeId = searchParams.get("place_id");

    if (!placeId) {
      return NextResponse.json(
        { error: "place_id requis" },
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

    const url = `https://maps.googleapis.com/maps/api/place/details/json`;
    const params = new URLSearchParams({
      place_id: placeId,
      key: apiKey,
      language: "fr",
      fields: "place_id,formatted_address,address_components,geometry",
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.status === "OK" && data.result) {
      return NextResponse.json({
        success: true,
        result: data.result,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: data.error_message || data.status,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("❌ Erreur détails adresse:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de la récupération des détails",
      },
      { status: 500 }
    );
  }
}

