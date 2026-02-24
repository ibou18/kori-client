"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GooglePlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlaceDetails {
  place_id: string;
  formatted_address: string;
  address_components: AddressComponent[];
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface AddressData {
  street: string;
  city: string;
  postalCode: string;
  country: string;
  apartment?: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
}

interface GoogleAddressAutocompleteProps {
  id?: string;
  label?: string;
  value?: string;
  onAddressSelect: (address: AddressData) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

export function GoogleAddressAutocomplete({
  id = "address",
  label = "Adresse",
  value = "",
  onAddressSelect,
  error,
  disabled = false,
  required = false,
  placeholder = "Rechercher une adresse...",
}: GoogleAddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [predictions, setPredictions] = useState<GooglePlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Synchroniser query avec value quand value change depuis l'extérieur
  useEffect(() => {
    if (value !== undefined && value !== query) {
      setQuery(value || "");
      // Réinitialiser la sélection si la valeur change depuis l'extérieur
      if (!value) {
        setSelectedAddress(null);
        setPredictions([]);
        setShowPredictions(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Fermer les suggestions quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowPredictions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Rechercher des prédictions d'adresses
  const searchAddresses = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    console.log("🔍 Recherche d'adresses pour:", searchQuery);
    setIsLoading(true);
    try {
      // Utiliser l'endpoint API proxy pour éviter les problèmes CORS
      const url = `/api/google-places/autocomplete?input=${encodeURIComponent(
        searchQuery.trim()
      )}`;
      console.log("📡 Appel API:", url);
      
      const response = await fetch(url);
      const data = await response.json();

      console.log("📥 Réponse API:", data);

      if (data.success && data.predictions) {
        console.log(`✅ ${data.predictions.length} prédictions trouvées`);
        setPredictions(data.predictions);
        setShowPredictions(true);
      } else {
        console.warn("⚠️ Aucune prédiction ou erreur:", data.error || data);
        setPredictions([]);
        setShowPredictions(false);
        
        // Afficher un message d'erreur spécifique pour les erreurs de configuration
        if (data.error) {
          console.warn("⚠️ Erreur recherche adresses:", data.error);
          
          // Si c'est une erreur de facturation Google, afficher un message plus clair
          if (data.error.includes("Billing") || data.error.includes("REQUEST_DENIED")) {
            console.error("❌ Google Places API nécessite la facturation activée sur Google Cloud Console");
            console.error("❌ Veuillez activer la facturation sur: https://console.cloud.google.com/project/_/billing/enable");
          }
        }
      }
    } catch (error) {
      console.error("❌ Erreur recherche adresses:", error);
      setPredictions([]);
      setShowPredictions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer les détails d'une adresse
  const getPlaceDetails = async (
    placeId: string
  ): Promise<GooglePlaceDetails | null> => {
    try {
      // Utiliser l'endpoint API proxy pour éviter les problèmes CORS
      const response = await fetch(
        `/api/google-places/details?place_id=${encodeURIComponent(placeId)}`
      );
      const data = await response.json();

      if (data.success && data.result) {
        return data.result;
      }
      if (data.error) {
        console.warn("⚠️ Erreur détails adresse:", data.error);
      }
      return null;
    } catch (error) {
      console.error("❌ Erreur détails adresse:", error);
      return null;
    }
  };

  // Extraire les composants d'adresse
  const extractAddressComponents = (
    details: GooglePlaceDetails
  ): AddressData => {
    const components = details.address_components;
    let street = "";
    let city = "";
    let postalCode = "";
    let country = "Canada";
    const apartment = "";

    // Extraire la rue (street_number + route)
    const streetNumber = components.find((c) =>
      c.types.includes("street_number")
    )?.long_name;
    const route = components.find((c) => c.types.includes("route"))?.long_name;
    if (streetNumber && route) {
      street = `${streetNumber} ${route}`;
    } else if (route) {
      street = route;
    }

    // Extraire la ville
    const locality = components.find((c) =>
      c.types.includes("locality")
    )?.long_name;
    const administrativeAreaLevel1 = components.find((c) =>
      c.types.includes("administrative_area_level_1")
    )?.long_name;
    city = locality || administrativeAreaLevel1 || "";

    // Extraire le code postal
    postalCode =
      components.find((c) => c.types.includes("postal_code"))?.long_name || "";

    // Extraire le pays
    const countryComponent = components.find((c) =>
      c.types.includes("country")
    );
    if (countryComponent) {
      const countryCode = countryComponent.short_name.toLowerCase();
      const countryMap: { [key: string]: string } = {
        ca: "Canada",
        fr: "France",
        sn: "Sénégal",
        be: "Belgique",
        ch: "Suisse",
        ma: "Maroc",
        tn: "Tunisie",
        dz: "Algérie",
      };
      country = countryMap[countryCode] || countryComponent.long_name;
    }

    return {
      street,
      city,
      postalCode,
      country,
      apartment,
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      formattedAddress: details.formatted_address,
    };
  };

  // Gérer le changement de texte avec debounce
  const handleTextChange = (text: string) => {
    setQuery(text);
    setSelectedAddress(null);

    if (!text.trim()) {
      setShowPredictions(false);
      setPredictions([]);
      return;
    }

    setShowPredictions(true);

    // Debounce la recherche
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      searchAddresses(text);
    }, 300);
  };

  // Gérer la sélection d'une prédiction
  const handleSelectPrediction = async (prediction: GooglePlacePrediction) => {
    setQuery(prediction.description);
    setShowPredictions(false);
    setPredictions([]);
    setIsLoading(true);

    try {
      const details = await getPlaceDetails(prediction.place_id);
      if (details) {
        const addressData = extractAddressComponents(details);
        setSelectedAddress(addressData);
        onAddressSelect(addressData);
      }
    } catch (error) {
      console.error("❌ Erreur sélection adresse:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <div className="relative mt-1">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleTextChange(e.target.value)}
          onFocus={() => {
            if (query.length >= 2 && predictions.length > 0) {
              setShowPredictions(true);
            } else if (query.length >= 2 && !isLoading) {
              // Déclencher une recherche si on a déjà du texte
              searchAddresses(query);
            }
          }}
          disabled={disabled}
          className={`pr-10 ${error ? "border-red-500" : ""}`}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        )}
        {!isLoading && selectedAddress && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <MapPin className="w-4 h-4 text-green-500" />
          </div>
        )}
      </div>

      {/* Suggestions */}
      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {predictions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handleSelectPrediction(prediction)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {prediction.structured_formatting.main_text}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {prediction.structured_formatting.secondary_text}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
