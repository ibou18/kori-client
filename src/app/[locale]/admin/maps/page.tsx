"use client";

import { useGetSalons } from "@/app/data/hooks";
import PageWrapper from "@/app/components/block/PageWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import "leaflet/dist/leaflet.css";

type SalonWithCoordinates = {
  id: string;
  name: string;
  isActive?: boolean;
  isVerified?: boolean;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    latitude?: number | string;
    longitude?: number | string;
  };
};

const DEFAULT_CENTER: [number, number] = [45.5017, -73.5673]; // Montreal

export default function MapsPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any | null>(null);

  const { data, isLoading } = useGetSalons({
    limit: 10000,
    offset: 0,
  });

  const salons = useMemo(
    () => ((data?.data || []) as SalonWithCoordinates[]),
    [data?.data],
  );

  const salonsWithCoords = useMemo(() => {
    return salons
      .map((salon) => {
        const latRaw = salon?.address?.latitude;
        const lngRaw = salon?.address?.longitude;
        const latitude = Number(latRaw);
        const longitude = Number(lngRaw);

        return {
          ...salon,
          latitude,
          longitude,
        };
      })
      .filter(
        (salon) =>
          Number.isFinite(salon.latitude) &&
          Number.isFinite(salon.longitude) &&
          Math.abs(salon.latitude) <= 90 &&
          Math.abs(salon.longitude) <= 180,
      );
  }, [salons]);

  const mapCenter = useMemo<[number, number]>(
    () =>
      salonsWithCoords.length
        ? [salonsWithCoords[0].latitude, salonsWithCoords[0].longitude]
        : DEFAULT_CENTER,
    [salonsWithCoords],
  );

  useEffect(() => {
    if (isLoading || !mapContainerRef.current) return;

    let isCancelled = false;

    const setupMap = async () => {
      const L = (await import("leaflet")).default;
      if (isCancelled || !mapContainerRef.current) return;

      // Réinitialiser complètement la carte pour refléter le dernier dataset
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      });
      leafletMapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      if (salonsWithCoords.length > 0) {
        const bounds = L.latLngBounds(
          salonsWithCoords.map((salon) => [salon.latitude, salon.longitude]),
        );
        map.fitBounds(bounds, { padding: [30, 30] });
      } else {
        map.setView(mapCenter, 11);
      }

      salonsWithCoords.forEach((salon) => {
        const marker = L.circleMarker([salon.latitude, salon.longitude], {
          radius: 8,
          color: "#2A3731",
          fillColor: "#53745D",
          fillOpacity: 0.85,
          weight: 1.5,
        }).addTo(map);

        const address = [salon.address?.street, salon.address?.city]
          .filter(Boolean)
          .join(", ");

        marker.bindPopup(`
          <div style="min-width: 180px;">
            <p style="margin: 0; font-weight: 600; color: #1e293b;">${salon.name}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #475569;">${address || "Adresse non renseignée"}</p>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">${salon.latitude.toFixed(
              6,
            )}, ${salon.longitude.toFixed(6)}</p>
          </div>
        `);
      });
    };

    setupMap();

    return () => {
      isCancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [isLoading, salonsWithCoords, mapCenter]);

  return (
    <PageWrapper
      title="Carte des salons"
      description="Visualisation des salons existants à partir de leurs coordonnées GPS"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Salons total</p>
            <p className="text-2xl font-bold text-[#53745D]">{salons.length}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Avec coordonnées GPS</p>
            <p className="text-2xl font-bold text-[#53745D]">
              {salonsWithCoords.length}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-gray-500">Sans coordonnées GPS</p>
            <p className="text-2xl font-bold text-[#53745D]">
              {Math.max(salons.length - salonsWithCoords.length, 0)}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-[#53745D]" />
            Les marqueurs verts représentent les salons avec coordonnées GPS
          </div>

          {isLoading ? (
            <Skeleton className="h-[70vh] w-full" />
          ) : (
            <div
              ref={mapContainerRef}
              className="h-[70vh] w-full overflow-hidden rounded-md border"
            />
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
