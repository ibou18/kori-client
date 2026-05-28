"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import {
  useCreateSalonService,
  useDeleteSalonService,
  useGetSalonServices,
  useGetServiceCategories,
  useReactivateSalonService,
  useUpdateSalonService,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
// Headless UI Switch uses `checked` + `onChange` (not `onCheckedChange`)
import { Textarea } from "@/components/ui/textarea";
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
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";

interface ServiceOption {
  id?: string;
  name: string;
  price: number;
  discountPrice?: number | null;
}

interface SalonService {
  id: string;
  name: string;
  description?: string;
  particularities?: string;
  duration?: number;
  isActive: boolean;
  categoryId?: string;
  category?: { id: string; name: string };
  options?: ServiceOption[];
}

const EMPTY_FORM = {
  name: "",
  description: "",
  particularities: "",
  duration: 60,
  categoryId: "",
  isActive: true,
  options: [{ name: "", price: 0, discountPrice: null }] as ServiceOption[],
};

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
  const { data: session } = useSession();
  const user = session?.user as { role?: string; salonId?: string } | undefined;
  const salonId = user?.salonId ?? "";

  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<SalonService | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: servicesRes, isLoading } = useGetSalonServices(salonId);
  const { data: categoriesRes } = useGetServiceCategories();

  const { mutate: createService, isPending: creating } = useCreateSalonService();
  const { mutate: updateService, isPending: updating } = useUpdateSalonService();
  const { mutate: deleteService, isPending: deleting } = useDeleteSalonService();
  const { mutate: reactivateService } = useReactivateSalonService();

  const services: SalonService[] = useMemo(() => {
    const raw = servicesRes as any;
    return Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
  }, [servicesRes]);

  const categories: { id: string; name: string }[] = useMemo(() => {
    const raw = categoriesRes as any;
    return Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
  }, [categoriesRes]);

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

  const openCreate = () => {
    setEditingService(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  };

  const openEdit = (service: SalonService) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description ?? "",
      particularities: service.particularities ?? "",
      duration: service.duration ?? 60,
      categoryId: service.categoryId ?? "",
      isActive: service.isActive,
      options:
        service.options && service.options.length > 0
          ? service.options.map((o) => ({
              id: o.id,
              name: o.name ?? "",
              price: Number(o.price),
              discountPrice: o.discountPrice != null ? Number(o.discountPrice) : null,
            }))
          : [{ name: "", price: 0, discountPrice: null }],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      salonId,
      name: form.name,
      description: form.description || undefined,
      particularities: form.particularities || undefined,
      duration: Number(form.duration),
      categoryId: form.categoryId || undefined,
      isActive: form.isActive,
      options: form.options
        .filter((o) => o.name || o.price > 0)
        .map((o) => ({
          ...(o.id ? { id: o.id } : {}),
          name: o.name || undefined,
          price: Number(o.price),
          discountPrice: o.discountPrice != null ? Number(o.discountPrice) : undefined,
        })),
    };

    if (editingService) {
      updateService(
        { serviceId: editingService.id, data: payload },
        { onSuccess: () => setIsDialogOpen(false) },
      );
    } else {
      createService(payload, { onSuccess: () => setIsDialogOpen(false) });
    }
  };

  const addOption = () =>
    setForm((f) => ({
      ...f,
      options: [...f.options, { name: "", price: 0, discountPrice: null }],
    }));

  const removeOption = (i: number) =>
    setForm((f) => ({
      ...f,
      options: f.options.filter((_, idx) => idx !== i),
    }));

  const updateOption = (i: number, field: keyof ServiceOption, value: any) =>
    setForm((f) => ({
      ...f,
      options: f.options.map((o, idx) =>
        idx === i ? { ...o, [field]: value } : o,
      ),
    }));

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
      {/* Header toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
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
        <Button
          onClick={openCreate}
          className="bg-[#53745D] hover:bg-[#3a5a47] text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau service
        </Button>
      </div>

      {/* Counter */}
      <p className="mb-3 text-sm text-slate-500">
        {filtered.length} service{filtered.length !== 1 ? "s" : ""}
        {search || filterActive !== "all" ? " (filtré)" : ""}
      </p>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#53745D]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-14 text-center">
          <Scissors className="mb-3 h-10 w-10 text-slate-300" />
          <p className="font-medium text-slate-500">Aucun service trouvé</p>
          <p className="mt-1 text-sm text-slate-400">
            {search
              ? "Essayez un autre terme de recherche"
              : "Commencez par créer votre premier service"}
          </p>
          {!search && (
            <Button
              onClick={openCreate}
              variant="outline"
              className="mt-4 gap-2 border-[#53745D]/40 text-[#53745D]"
            >
              <Plus className="h-4 w-4" />
              Créer un service
            </Button>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((service) => {
            const minPrice = service.options?.length
              ? Math.min(...service.options.map((o) => o.discountPrice ?? o.price))
              : null;
            const maxPrice = service.options?.length
              ? Math.max(...service.options.map((o) => o.discountPrice ?? o.price))
              : null;

            return (
              <li
                key={service.id}
                className={`rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md ${
                  !service.isActive ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F4F1]">
                    <Scissors className="h-5 w-5 text-[#53745D]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{service.name}</p>
                      {service.category && (
                        <Badge variant="secondary" className="text-xs">
                          {service.category.name}
                        </Badge>
                      )}
                      <Badge
                        variant={service.isActive ? "default" : "secondary"}
                        className={
                          service.isActive
                            ? "bg-[#F0F4F1] text-[#53745D] hover:bg-[#D6E3D8]"
                            : ""
                        }
                      >
                        {service.isActive ? "Actif" : "Inactif"}
                      </Badge>
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
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {!service.isActive && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#53745D] hover:bg-[#F0F4F1]"
                        title="Réactiver"
                        onClick={() => reactivateService(service.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-slate-100"
                      onClick={() => openEdit(service)}
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
      )}

      {/* Create / Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Modifier le service" : "Nouveau service"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div>
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Coupe femme"
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Décrivez le service…"
                className="mt-1 resize-none"
                rows={2}
              />
            </div>

            {/* Particularities */}
            <div>
              <Label htmlFor="part">Particularités</Label>
              <Input
                id="part"
                value={form.particularities}
                onChange={(e) =>
                  setForm((f) => ({ ...f, particularities: e.target.value }))
                }
                placeholder="Ex: Inclut shampooing et coiffage"
                className="mt-1"
              />
            </div>

            {/* Duration + Category */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="duration">Durée (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={5}
                  step={5}
                  value={form.duration}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, duration: Number(e.target.value) }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, categoryId: v }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choisir…" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium">Service actif</p>
                <p className="text-xs text-slate-500">
                  Visible sur votre page publique
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onChange={(v: boolean) => setForm((f) => ({ ...f, isActive: v }))}
              />
            </div>

            {/* Options (prix) */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Options & prix</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs text-[#53745D]"
                  onClick={addOption}
                >
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </Button>
              </div>
              <div className="space-y-2">
                {form.options.map((opt, i) => (
                  <div key={i} className="grid grid-cols-[1fr_90px_90px_32px] gap-2 items-center">
                    <Input
                      placeholder="Nom option"
                      value={opt.name}
                      onChange={(e) => updateOption(i, "name", e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="Prix $"
                      value={opt.price}
                      onChange={(e) =>
                        updateOption(i, "price", Number(e.target.value))
                      }
                      className="text-sm"
                    />
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      placeholder="Promo $"
                      value={opt.discountPrice ?? ""}
                      onChange={(e) =>
                        updateOption(
                          i,
                          "discountPrice",
                          e.target.value === "" ? null : Number(e.target.value),
                        )
                      }
                      className="text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:bg-red-50"
                      onClick={() => removeOption(i)}
                      disabled={form.options.length === 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-slate-400">
                  Prix en dollars (ex: 45.00). Le champ Promo est optionnel.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.name || creating || updating}
              className="bg-[#53745D] hover:bg-[#3a5a47] text-white"
            >
              {(creating || updating) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingService ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  deleteService(deleteConfirm, {
                    onSuccess: () => setDeleteConfirm(null),
                  });
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
