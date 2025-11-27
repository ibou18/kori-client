import { NextResponse } from "next/server";

/**
 * API Route pour récupérer un service
 * Proxy vers le serveur backend pour éviter les problèmes CORS
 * et permettre l'accès depuis les composants client
 */
export async function GET({
  params,
}: {
  params:
    | Promise<{ salonId: string; serviceId: string }>
    | { salonId: string; serviceId: string };
}) {
  try {
    // Gérer les paramètres qui peuvent être une Promise (Next.js 15+) ou un objet (Next.js 13-14)
    const resolvedParams = await Promise.resolve(params);
    const { salonId, serviceId } = resolvedParams;

    if (!salonId || !serviceId) {
      return NextResponse.json(
        { error: "salonId et serviceId sont requis" },
        { status: 400 }
      );
    }

    const apiBaseUrl = process.env.NEXT_API_URL || "http://localhost:2020";
    const apiUrl = `${apiBaseUrl}/api/salons/${salonId}/services/${serviceId}`;

    console.log("🔗 Proxy API - Fetching service:", {
      salonId,
      serviceId,
      apiUrl,
    });

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
      // Ajouter cache pour éviter les problèmes de revalidation
      cache: "no-store",
    });

    console.log("📡 Backend response status:", response.status);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Erreur inconnue" }));
      console.error("❌ Backend error:", {
        status: response.status,
        errorData,
      });
      return NextResponse.json(
        {
          error: errorData.message || "Service non trouvé",
          errorCode: errorData.errorCode || "SERVICE_NOT_FOUND",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("✅ Service data received:", {
      hasData: !!data.data,
      serviceId,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Erreur proxy API:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération du service",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
