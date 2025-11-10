"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { CategoryIcon, SalonTypeIcon } from "@/app/components/CategoryIcon";
import {
  useCreateDefaultService,
  useGetDefaultServices,
  useGetServiceCategories,
  useUpdateDefaultService,
  useUpdateServiceCategory,
} from "@/app/data/hooks";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { message } from "antd";
import { Edit2, Plus, Trash2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface DefaultService {
  id: string;
  customId: string;
  name: string;
  description?: string;
  duration: number;
  salonType: string;
  group: string;
  hasThicknessOptions: boolean;
  requiresExtensions: boolean;
  availableLocations: string[];
  isActive: boolean;
  category: {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    isActive?: boolean;
  };
  defaultOptions?: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
    thickness?: string;
    requiresExtensions: boolean;
  }>;
}

interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

const SALON_TYPES = [
  { value: "HAIRDRESSER", label: "Coiffeur" },
  { value: "BARBER", label: "Barbier" },
  { value: "NAIL_SALON", label: "Manucure" },
  { value: "SPA", label: "Spa" },
  { value: "BEAUTY", label: "Beauté" },
];

const SERVICE_GROUPS = [
  { value: "WITH_OPTIONS", label: "Avec options d'épaisseur" },
  { value: "SIMPLE", label: "Simple" },
];

const SERVICE_LOCATIONS = [
  { value: "SALON_ONLY", label: "Au salon uniquement" },
  { value: "HOME_ONLY", label: "À domicile uniquement" },
  { value: "BOTH", label: "Au salon et à domicile" },
];

export default function ServicesPage() {
  const { data: session } = useSession();
  const [editingService, setEditingService] = useState<DefaultService | null>(
    null
  );
  const [creatingService, setCreatingService] = useState<string | null>(null); // salonType pour la création
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: 0,
    salonType: "",
    group: "",
    categoryId: "",
    hasThicknessOptions: false,
    requiresExtensions: false,
    availableLocations: [] as string[],
    isActive: true,
  });

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetServiceCategories();
  const { data: servicesData, isLoading: servicesLoading } =
    useGetDefaultServices();
  const { mutate: createService, isPending: isCreating } =
    useCreateDefaultService();
  const { mutate: updateService, isPending: isUpdating } =
    useUpdateDefaultService();
  const { mutate: updateCategory } = useUpdateServiceCategory();

  // Initialiser le formulaire quand on ouvre le modal
  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name || "",
        description: editingService.description || "",
        duration: editingService.duration || 0,
        salonType: editingService.salonType || "",
        group: editingService.group || "",
        categoryId: editingService.category?.id || "",
        hasThicknessOptions: editingService.hasThicknessOptions || false,
        requiresExtensions: editingService.requiresExtensions || false,
        availableLocations: editingService.availableLocations || [],
        isActive: editingService.isActive ?? true,
      });
    } else if (creatingService) {
      // Initialiser pour la création avec le salonType pré-rempli
      setFormData({
        name: "",
        description: "",
        duration: 60,
        salonType: creatingService,
        group: "SIMPLE",
        categoryId: "",
        hasThicknessOptions: false,
        requiresExtensions: false,
        availableLocations: ["SALON_ONLY"],
        isActive: true,
      });
    }
  }, [editingService, creatingService]);

  if (!session) {
    return (
      <PageWrapper title="Services">
        <p className="text-center mt-10">
          Connexion requise pour accéder à cette page!
        </p>
      </PageWrapper>
    );
  }

  const categories: ServiceCategory[] = categoriesData?.data || [];
  const services: DefaultService[] = servicesData?.data || [];

  // Le backend gère déjà le filtrage selon le rôle, on affiche simplement ce qui est retourné
  // Organiser les services par type de salon, puis par catégorie
  const servicesBySalonType = services.reduce(
    (acc, service) => {
      const salonType = service.salonType || "OTHER";
      if (!acc[salonType]) {
        acc[salonType] = {
          salonType,
          categories: {} as Record<
            string,
            { category: ServiceCategory; services: DefaultService[] }
          >,
        };
      }

      const categoryId = service.category?.id;
      const category = categories.find((c) => c.id === categoryId);

      if (categoryId && category) {
        if (!acc[salonType].categories[categoryId]) {
          acc[salonType].categories[categoryId] = {
            category,
            services: [],
          };
        }
        acc[salonType].categories[categoryId].services.push(service);
      }
      return acc;
    },
    {} as Record<
      string,
      {
        salonType: string;
        categories: Record<
          string,
          { category: ServiceCategory; services: DefaultService[] }
        >;
      }
    >
  );

  // Filtrer les types de salon qui n'ont plus de services/catégories
  // Le backend gère déjà le filtrage selon le rôle utilisateur
  const filteredServicesBySalonType = Object.fromEntries(
    Object.entries(servicesBySalonType).filter(
      ([, data]) => Object.keys(data.categories).length > 0
    )
  );

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount / 100);
  };

  const getSalonTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      HAIRDRESSER: "Coiffeur",
      BARBER: "Barbier",
      NAIL_SALON: "Manucure",
      SPA: "Spa",
      BEAUTY: "Beauté",
    };
    return labels[type] || type;
  };

  const getGroupLabel = (group: string) => {
    const labels: Record<string, string> = {
      WITH_OPTIONS: "Avec options d'épaisseur",
      SIMPLE: "Simple",
    };
    return labels[group] || group;
  };

  const handleEdit = (service: DefaultService) => {
    setEditingService(service);
  };

  const handleCloseModal = () => {
    setEditingService(null);
    setCreatingService(null);
  };

  const handleCreateService = (salonType: string) => {
    setCreatingService(salonType);
    setEditingService(null);
  };

  const handleLocationToggle = (location: string) => {
    setFormData((prev) => {
      const locations = prev.availableLocations.includes(location)
        ? prev.availableLocations.filter((l) => l !== location)
        : [...prev.availableLocations, location];
      return { ...prev, availableLocations: locations };
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.categoryId || !formData.salonType) {
      message.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (editingService) {
      // Mise à jour
      updateService(
        {
          id: editingService.id,
          updates: {
            name: formData.name,
            description: formData.description || undefined,
            duration: formData.duration,
            salonType: formData.salonType,
            group: formData.group,
            categoryId: formData.categoryId,
            hasThicknessOptions: formData.hasThicknessOptions,
            requiresExtensions: formData.requiresExtensions,
            availableLocations: formData.availableLocations,
            isActive: formData.isActive,
          },
        },
        {
          onSuccess: () => {
            handleCloseModal();
          },
        }
      );
    } else if (creatingService) {
      // Création
      createService(
        {
          name: formData.name,
          description: formData.description || undefined,
          duration: formData.duration,
          salonType: formData.salonType,
          group: formData.group,
          categoryId: formData.categoryId,
          hasThicknessOptions: formData.hasThicknessOptions,
          requiresExtensions: formData.requiresExtensions,
          availableLocations: formData.availableLocations,
          isActive: formData.isActive,
        },
        {
          onSuccess: () => {
            handleCloseModal();
          },
        }
      );
    }
  };

  const handleDelete = () => {
    // TODO: Implémenter la suppression
    message.info("Fonctionnalité de suppression à venir");
  };

  if (categoriesLoading || servicesLoading) {
    return (
      <PageWrapper title="Services">
        <div className="text-center mt-10">Chargement...</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Services par Défaut">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Services par Défaut</h2>
            <p className="text-gray-600 mt-1">
              Gérez les services par défaut organisés par catégories
            </p>
          </div>
        </div>

        {Object.keys(filteredServicesBySalonType).length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              Aucun service trouvé
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {Object.values(filteredServicesBySalonType).map(
              ({ salonType, categories: salonCategories }) => {
                const totalServices = Object.values(salonCategories).reduce(
                  (sum, cat) => sum + cat.services.length,
                  0
                );
                return (
                  <AccordionItem
                    key={salonType}
                    value={salonType}
                    className="border rounded-lg px-4 bg-white"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <SalonTypeIcon
                            salonType={salonType}
                            className="text-[#53745D]"
                            size={32}
                          />
                          <div className="text-left">
                            <div className="font-semibold text-lg">
                              {getSalonTypeLabel(salonType)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {Object.keys(salonCategories).length} catégorie
                              {Object.keys(salonCategories).length > 1
                                ? "s"
                                : ""}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-auto">
                          <Badge variant="outline">
                            {totalServices} service
                            {totalServices > 1 ? "s" : ""}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateService(salonType);
                            }}
                            className="h-8 w-8 p-0"
                            title="Ajouter un service"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        <Accordion type="multiple" className="space-y-3">
                          {Object.values(salonCategories).map(
                            ({ category, services: categoryServices }) => (
                              <AccordionItem
                                key={category.id}
                                value={category.id}
                                className="border rounded-lg px-4 bg-gray-50"
                              >
                                <AccordionTrigger className="hover:no-underline">
                                  <div className="flex items-center justify-between w-full pr-4">
                                    <div className="flex items-center gap-3">
                                      <CategoryIcon
                                        iconName={category.icon}
                                        className="text-[#53745D]"
                                        size={24}
                                      />
                                      <div className="text-left">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold">
                                            {category.name}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className={
                                              category.isActive !== false
                                                ? "bg-[#F0F4F1] text-[#53745D] border-[#53745D]"
                                                : "bg-red-100 text-red-800 border-red-300"
                                            }
                                          >
                                            {category.isActive !== false
                                              ? "Actif"
                                              : "Inactif"}
                                          </Badge>
                                        </div>
                                        {category.description && (
                                          <div className="text-xs text-gray-600">
                                            {category.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 ml-auto">
                                      <Badge variant="outline">
                                        {categoryServices.length} service
                                        {categoryServices.length > 1 ? "s" : ""}
                                      </Badge>
                                      <Switch
                                        checked={category.isActive !== false}
                                        onChange={(checked: boolean) => {
                                          updateCategory({
                                            id: category.id,
                                            updates: {
                                              isActive: checked,
                                            },
                                          });
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        title={
                                          category.isActive !== false
                                            ? "Désactiver la catégorie"
                                            : "Activer la catégorie"
                                        }
                                      />
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4 pt-4">
                                    {categoryServices.map((service) => (
                                      <Card
                                        key={service.id}
                                        className={`border-l-4 ${
                                          service.isActive
                                            ? "border-l-[#53745D]"
                                            : "border-l-red-400 opacity-75"
                                        }`}
                                      >
                                        <CardHeader>
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <CardTitle className="text-lg">
                                                {service.name}
                                              </CardTitle>
                                              {service.description && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                  {service.description}
                                                </p>
                                              )}
                                              <div className="flex flex-wrap gap-2 mt-3">
                                                <Badge variant="outline">
                                                  {getSalonTypeLabel(
                                                    service.salonType
                                                  )}
                                                </Badge>
                                                <Badge variant="outline">
                                                  {getGroupLabel(service.group)}
                                                </Badge>
                                                <Badge
                                                  variant="outline"
                                                  className={
                                                    service.isActive
                                                      ? "bg-[#F0F4F1] text-[#53745D] border-[#53745D]"
                                                      : "bg-red-100 text-red-800 border-red-300"
                                                  }
                                                >
                                                  {service.isActive
                                                    ? "Actif"
                                                    : "Inactif"}
                                                </Badge>
                                                {service.hasThicknessOptions && (
                                                  <Badge variant="outline">
                                                    Options d'épaisseur
                                                  </Badge>
                                                )}
                                                {service.requiresExtensions && (
                                                  <Badge variant="outline">
                                                    Rallonges requises
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-3 ml-4">
                                              <div className="flex items-center gap-2">
                                                <Label
                                                  htmlFor={`service-toggle-${service.id}`}
                                                  className="text-sm text-gray-600"
                                                >
                                                  Actif
                                                </Label>
                                                <Switch
                                                  id={`service-toggle-${service.id}`}
                                                  checked={service.isActive}
                                                  onChange={(
                                                    checked: boolean
                                                  ) => {
                                                    updateService({
                                                      id: service.id,
                                                      updates: {
                                                        isActive: checked,
                                                      },
                                                    });
                                                  }}
                                                />
                                              </div>
                                              <div className="flex gap-2">
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    handleEdit(service)
                                                  }
                                                >
                                                  <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => handleDelete()}
                                                  className="text-red-600 hover:text-red-700"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                              <p className="text-sm font-medium text-gray-700">
                                                Durée par défaut
                                              </p>
                                              <p className="text-sm text-gray-600">
                                                {formatDuration(
                                                  service.duration
                                                )}
                                              </p>
                                            </div>
                                            {service.defaultOptions &&
                                              service.defaultOptions.length >
                                                0 && (
                                                <div>
                                                  <p className="text-sm font-medium text-gray-700 mb-2">
                                                    Options disponibles
                                                  </p>
                                                  <div className="flex flex-col lg:flex-row gap-2 lg:gap-3">
                                                    {service.defaultOptions.map(
                                                      (option) => (
                                                        <div
                                                          key={option.id}
                                                          className="flex items-center justify-between p-2 bg-gray-50 rounded flex-1 lg:flex-initial lg:min-w-[140px]"
                                                        >
                                                          <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                              {option.name}
                                                              {option.thickness && (
                                                                <span className="text-gray-600 ml-1">
                                                                  (
                                                                  {
                                                                    option.thickness
                                                                  }
                                                                  )
                                                                </span>
                                                              )}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                              {formatDuration(
                                                                option.duration
                                                              )}
                                                            </p>
                                                          </div>
                                                          <p className="text-sm font-semibold text-[#53745D] ml-2 flex-shrink-0">
                                                            {formatCurrency(
                                                              option.price
                                                            )}
                                                          </p>
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                </div>
                                              )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )
                          )}
                        </Accordion>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              }
            )}
          </Accordion>
        )}

        {/* Modal de modification/création */}
        <Dialog
          open={!!editingService || !!creatingService}
          onOpenChange={handleCloseModal}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Modifier le service" : "Créer un service"}
              </DialogTitle>
              <DialogDescription>
                {editingService
                  ? "Modifiez les informations du service par défaut"
                  : "Remplissez les informations pour créer un nouveau service par défaut"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Nom */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nom du service <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nom du service"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Description du service"
                  rows={3}
                />
              </div>

              {/* Catégorie */}
              <div className="space-y-2">
                <Label htmlFor="category">
                  Catégorie <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type de salon */}
              <div className="space-y-2">
                <Label htmlFor="salonType">
                  Type de salon <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.salonType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, salonType: value })
                  }
                >
                  <SelectTrigger id="salonType">
                    <SelectValue placeholder="Sélectionner un type de salon" />
                  </SelectTrigger>
                  <SelectContent>
                    {SALON_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Groupe */}
              <div className="space-y-2">
                <Label htmlFor="group">
                  Groupe <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.group}
                  onValueChange={(value) =>
                    setFormData({ ...formData, group: value })
                  }
                >
                  <SelectTrigger id="group">
                    <SelectValue placeholder="Sélectionner un groupe" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICE_GROUPS.map((group) => (
                      <SelectItem key={group.value} value={group.value}>
                        {group.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Durée */}
              <div className="space-y-2">
                <Label htmlFor="duration">
                  Durée (en minutes) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Durée en minutes"
                />
              </div>

              {/* Lieux disponibles - Tags */}
              <div className="space-y-2">
                <Label>Lieux disponibles</Label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_LOCATIONS.map((location) => (
                    <Badge
                      key={location.value}
                      variant={
                        formData.availableLocations.includes(location.value)
                          ? "default"
                          : "outline"
                      }
                      className="cursor-pointer px-3 py-1"
                      onClick={() => handleLocationToggle(location.value)}
                    >
                      {location.label}
                      {formData.availableLocations.includes(location.value) && (
                        <X className="ml-2 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Options d'épaisseur</Label>
                    <p className="text-sm text-gray-500">
                      Le service a des options d'épaisseur (Petit, Moyen, Gros)
                    </p>
                  </div>
                  <Switch
                    checked={formData.hasThicknessOptions}
                    onChange={(checked: boolean) =>
                      setFormData({
                        ...formData,
                        hasThicknessOptions: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rallonges requises</Label>
                    <p className="text-sm text-gray-500">
                      Le service nécessite des rallonges
                    </p>
                  </div>
                  <Switch
                    checked={formData.requiresExtensions}
                    onChange={(checked: boolean) =>
                      setFormData({
                        ...formData,
                        requiresExtensions: checked,
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Service actif</Label>
                    <p className="text-sm text-gray-500">
                      Le service est disponible et visible
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onChange={(checked: boolean) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCloseModal}
                disabled={isUpdating || isCreating}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isUpdating || isCreating}
              >
                {isUpdating || isCreating
                  ? editingService
                    ? "Enregistrement..."
                    : "Création..."
                  : editingService
                    ? "Enregistrer"
                    : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
}
