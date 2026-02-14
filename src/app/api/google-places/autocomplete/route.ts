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
      console.error("❌ GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY ? "Configurée" : "Non configurée");
      console.error("❌ NEXT_PUBLIC_GOOGLE_API_KEY:", process.env.NEXT_PUBLIC_GOOGLE_API_KEY ? "Configurée" : "Non configurée");
      return NextResponse.json(
        { 
          success: false,
          error: "Configuration API manquante - Veuillez configurer GOOGLE_API_KEY ou NEXT_PUBLIC_GOOGLE_API_KEY",
          predictions: []
        },
        { status: 500 }
      );
    }
    
    console.log("✅ Google API Key trouvée, longueur:", apiKey.length);

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json`;
    const params = new URLSearchParams({
      input: input.trim(),
      key: apiKey,
      language: "fr",
      region: "ca", // Prioriser les résultats canadiens
      components: "country:ca|country:fr|country:us", // Canada, France, USA
      types: "address", // Limiter aux adresses
    });

    console.log("📡 Appel Google Places API:", `${url}?${params.toString().replace(/key=[^&]+/, "key=***")}`);
    
    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    console.log("📥 Réponse Google Places API - Status:", data.status);
    
    if (data.status === "OK" && data.predictions) {
      console.log(`✅ ${data.predictions.length} prédictions reçues de Google`);
      return NextResponse.json({
        success: true,
        predictions: data.predictions,
      });
    } else {
      console.error("❌ Erreur Google Places API:", {
        status: data.status,
        error_message: data.error_message,
        predictions: data.predictions?.length || 0
      });
      
      // Message d'erreur plus explicite pour les erreurs de configuration
      let errorMessage = data.error_message || data.status || "Erreur inconnue";
      if (data.status === "REQUEST_DENIED" && data.error_message?.includes("Billing")) {
        errorMessage = "La facturation Google Cloud doit être activée pour utiliser l'autocomplete d'adresses. Veuillez contacter l'administrateur.";
        console.error("💡 Solution: Activer la facturation sur https://console.cloud.google.com/project/_/billing/enable");
      }
      
      return NextResponse.json({
        success: false,
        predictions: [],
        error: errorMessage,
        status: data.status,
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

