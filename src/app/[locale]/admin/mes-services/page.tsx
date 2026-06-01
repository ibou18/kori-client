"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import {
  useDeleteSalonService,
  useReactivateSalonService,
} from "@/app/data/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Clock,
  Edit2,
  Loader2,
  Plus,
  RefreshCw,
  Scissors,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getCategoryName, getSalonTypeText } from "./components/serviceForm";
import {
  SalonServiceItem,
  useMesServicesData,
} from "./components/useMesServicesData";

const formatCad = (dollars: number) =>
  new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(
    dollars,
  );

const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
};

export default function MesServicesPage() {
  const router = useRouter();
  const { salonId, salonTypes, services, isLoadingServices } =
    useMesServicesData();

  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { mutate: deleteService, isPending: deleting } = useDeleteSalonService();
  const { mutate: reactivateService } = useReactivateSalonService();

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        !search || s.name.toLowerCase().includes(search.toLowerCase());
      const matchActive =
        filterActive === "all" ||
        (filterActive === "active" && s.isActive) ||
        (filterActive === "inactive" && !s.isActive);
      return matchSearch && matchActive;
    });
  }, [services, search, filterActive]);

  // Une section par type de salon (parité mobile). Les services dont le type
  // ne correspond à aucune section retombent dans la première.
  const sections = useMemo(() => {
    const map = salonTypes.map((type) => ({
      type,
      name: getSalonTypeText(type),
      services: [] as SalonServiceItem[],
    }));
    filtered.forEach((service) => {
      const idx = map.findIndex((s) => s.type === service.salonType);
      if (idx !== -1) map[idx].services.push(service);
      else if (map.length) map[0].services.push(service);
    });
    return map;
  }, [salonTypes, filtered]);

  const openCreate = (salonType: string) =>
    router.push(`/admin/mes-services/new?salonType=${salonType}`);
  const openEdit = (id: string, salonType?: string) =>
    router.push(
      `/admin/mes-services/${id}/edit${
        salonType ? `?salonType=${salonType}` : ""
      }`,
    );

  if (!salonId) {
    return (
      <PageWrapper title="Mes services">
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
          Aucun salon associé à votre compte.
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Mes services">
      {/* Toolbar : recherche + filtre actif */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Rechercher un service…"
            className="pl-8 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilterActive(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filterActive === f
                  ? "bg-[#53745D] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f === "all" ? "Tous" : f === "active" ? "Actifs" : "Inactifs"}
            </button>
          ))}
        </div>
      </div>

      {isLoadingServices ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#53745D]" />
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.type}>
              {/* En-tête de section */}
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  {section.name}
                </h2>
                <Badge
                  variant="secondary"
                  className="bg-[#F0F4F1] text-[#53745D]"
                >
                  {section.services.length} service
                  {section.services.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              {section.services.length === 0 ? (
                <div className="flex flex-col items-start gap-3 rounded-xl border border-slate-200 bg-white p-6">
                  <p className="text-sm text-slate-500">
                    Aucun service dans cette catégorie.
                  </p>
                  <Button
                    onClick={() => openCreate(section.type)}
                    className="gap-2 bg-[#53745D] hover:bg-[#3a5a47] text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un service
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <ul className="space-y-3">
                    {section.services.map((service) => {
                      const minPrice = service.options?.length
                        ? Math.min(
                            ...service.options.map(
                              (o) => o.discountPrice ?? o.price,
                            ),
                          )
                        : null;
                      const maxPrice = service.options?.length
                        ? Math.max(
                            ...service.options.map(
                              (o) => o.discountPrice ?? o.price,
                            ),
                          )
                        : null;
                      const mainPhoto =
                        service.photos?.find((p) => p.isMain) ??
                        service.photos?.[0];

                      return (
                        <li
                          key={service.id}
                          className={`rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
                            !service.isActive ? "opacity-60" : ""
                          }`}
                        >
                          <div className="flex items-start gap-4 p-4">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F0F4F1]">
                              {mainPhoto ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={mainPhoto.url}
                                  alt={service.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Scissors className="h-6 w-6 text-[#53745D]" />
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                openEdit(service.id, service.salonType ?? section.type)
                              }
                              className="min-w-0 flex-1 text-left"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-slate-900">
                                  {service.name}
                                </p>
                                {service.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {getCategoryName(service.category)}
                                  </Badge>
                                )}
                                {!service.isActive && (
                                  <Badge variant="secondary">Inactif</Badge>
                                )}
                              </div>
                              {service.description && (
                                <p className="mt-0.5 text-sm text-slate-500 line-clamp-2">
                                  {service.description}
                                </p>
                              )}
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                {service.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                                    {formatDuration(service.duration)}
                                  </span>
                                )}
                                {minPrice !== null && maxPrice !== null && (
                                  <span className="font-medium text-[#53745D]">
                                    {minPrice === maxPrice
                                      ? formatCad(minPrice)
                                      : `${formatCad(minPrice)} – ${formatCad(maxPrice)}`}
                                  </span>
                                )}
                              </div>
                            </button>
                            <div className="flex shrink-0 items-center gap-1">
                              {!service.isActive && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-[#53745D] hover:bg-[#F0F4F1]"
                                  title="Réactiver"
                                  onClick={() =>
                                    reactivateService({
                                      salonId,
                                      serviceId: service.id,
                                    })
                                  }
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-slate-100"
                                onClick={() =>
                                  openEdit(service.id, service.salonType ?? section.type)
                                }
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:bg-red-50"
                                onClick={() => setDeleteConfirm(service.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  <Button
                    variant="outline"
                    onClick={() => openCreate(section.type)}
                    className="gap-2 border-[#53745D]/40 text-[#53745D] hover:bg-[#F0F4F1]"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un service
                  </Button>
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Delete confirm dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Supprimer ce service ?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Cette action est irréversible. Les réservations existantes ne seront
            pas affectées.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() => {
                if (deleteConfirm) {
                  deleteService(
                    { salonId, serviceId: deleteConfirm },
                    { onSuccess: () => setDeleteConfirm(null) },
                  );
                }
              }}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
}
