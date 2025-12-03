"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { CategoryIcon, SalonTypeIcon } from "@/app/components/CategoryIcon";
import {
  useCreateDefaultService,
  useCreateServiceCategory,
  useDeleteDefaultService,
  useDeleteServiceCategory,
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
import { SALON_TYPES } from "@/utils/constants";
import { message } from "antd";
import { Edit2, Info, Plus, Trash2, X } from "lucide-react";
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
    duration?: number; // Optionnel, utilise la durée du service si non défini
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
  const [creatingCategory, setCreatingCategory] = useState<boolean>(false); // Flag pour la création de catégorie
  const [editingCategory, setEditingCategory] =
    useState<ServiceCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
    icon: "",
    isActive: true,
  });
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);

  // Liste des icônes disponibles (basée sur CategoryIcon.tsx)
  const availableIcons = [
    { name: "scissors", label: "Scissors (Ciseaux)" },
    { name: "braids", label: "Braids (Tresses)" },
    { name: "braids-icon", label: "Braids Icon" },
    { name: "locs", label: "Locs" },
    { name: "installation", label: "Installation" },
    { name: "care", label: "Care (Soins)" },
    { name: "care-icon", label: "Care Icon" },
    { name: "chemical", label: "Chemical (Chimique)" },
    { name: "special", label: "Special (Spécial)" },
    { name: "men-haircut-icon", label: "Men Haircut (Coupe Homme)" },
    { name: "beard-icon", label: "Beard (Barbe)" },
    { name: "face-care-icon", label: "Face Care (Soin Visage)" },
    { name: "manicure-icon", label: "Manicure" },
    { name: "pedicure-icon", label: "Pedicure" },
    { name: "nail-art-icon", label: "Nail Art (Art des Ongles)" },
    { name: "heart", label: "Heart (Cœur)" },
    { name: "star", label: "Star (Étoile)" },
    { name: "user", label: "User (Utilisateur)" },
    { name: "hand", label: "Hand (Main)" },
    { name: "face", label: "Face (Visage)" },
    { name: "smile", label: "Smile (Sourire)" },
    { name: "palette", label: "Palette" },
    { name: "footprints", label: "Footprints (Empreintes)" },
    { name: "droplets", label: "Droplets (Gouttes)" },
    { name: "flask", label: "Flask (Flacon)" },
    { name: "sparkles", label: "Sparkles (Étincelles)" },
  ];
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
  const { mutate: deleteService } = useDeleteDefaultService();
  const { mutate: createCategory, isPending: isCreatingCategory } =
    useCreateServiceCategory();
  const { mutate: updateCategory } = useUpdateServiceCategory();
  const { mutate: deleteCategory } = useDeleteServiceCategory();

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

  // Initialiser le formulaire de catégorie
  useEffect(() => {
    if (editingCategory) {
      setCategoryFormData({
        name: editingCategory.name || "",
        description: editingCategory.description || "",
        icon: editingCategory.icon || "",
        isActive: editingCategory.isActive ?? true,
      });
    } else if (creatingCategory) {
      setCategoryFormData({
        name: "",
        description: "",
        icon: "",
        isActive: true,
      });
    }
  }, [editingCategory, creatingCategory]);

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

  const formatDuration = (minutes: number | undefined | null) => {
    if (!minutes || isNaN(minutes)) return "N/A";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const formatCurrency = (amount: number) => {
    // Les prix dans DefaultServiceOption sont stockés en dollars (pas en centimes)
    return new Intl.NumberFormat("fr-CA", {
      style: "currency",
      currency: "CAD",
    }).format(amount);
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

  const handleCloseCategoryModal = () => {
    setEditingCategory(null);
    setCreatingCategory(false);
  };

  const handleEditCategory = (category: ServiceCategory) => {
    setEditingCategory(category);
    setCreatingCategory(false);
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

  const handleDeleteService = (service: DefaultService) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer le service "${service.name}" ?`
      )
    ) {
      deleteService(service.id, {
        onSuccess: () => {
          message.success("Service supprimé avec succès");
        },
      });
    }
  };

  const handleDeleteCategory = (category: ServiceCategory) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?\n\nAttention : Cette action est irréversible et ne sera possible que si la catégorie ne contient aucun service.`
      )
    ) {
      deleteCategory(category.id, {
        onSuccess: () => {
          message.success("Catégorie supprimée avec succès");
        },
      });
    }
  };

  const handleSubmitCategory = () => {
    if (!categoryFormData.name) {
      message.error("Le nom de la catégorie est obligatoire");
      return;
    }

    if (editingCategory) {
      // Mise à jour
      updateCategory(
        {
          id: editingCategory.id,
          updates: {
            name: categoryFormData.name,
            description: categoryFormData.description || undefined,
            icon: categoryFormData.icon || undefined,
            isActive: categoryFormData.isActive,
          },
        },
        {
          onSuccess: () => {
            handleCloseCategoryModal();
          },
        }
      );
    } else if (creatingCategory) {
      // Création
      createCategory(
        {
          name: categoryFormData.name,
          description: categoryFormData.description || undefined,
          icon: categoryFormData.icon || undefined,
          isActive: categoryFormData.isActive,
        },
        {
          onSuccess: () => {
            handleCloseCategoryModal();
          },
        }
      );
    }
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
            {/* <h2 className="text-2xl font-bold">Services par Défaut</h2> */}
            <p className="text-gray-600 mt-1">
              Gérez les services par défaut organisés par catégories
            </p>
          </div>
          <Button
            variant="default"
            onClick={() => setCreatingCategory(true)}
            className="flex items-center gap-2"
            disabled={true}
          >
            <Plus className="h-4 w-4" />
            Créer une catégorie
          </Button>
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
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateService(salonType);
                            }}
                            className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer"
                            title="Ajouter un service"
                          >
                            <Plus className="h-4 w-4" />
                          </div>
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
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditCategory(category);
                                        }}
                                        className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                        title="Modifier la catégorie"
                                      >
                                        <Edit2 className="h-4 w-4" />
                                      </div>
                                      <div
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteCategory(category);
                                        }}
                                        className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer text-red-600 hover:text-red-700"
                                        title="Supprimer la catégorie"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </div>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2 pt-2">
                                    {categoryServices.map((service) => (
                                      <Card
                                        key={service.id}
                                        className={`border-l-4 ${
                                          service.isActive
                                            ? "border-l-[#53745D]"
                                            : "border-l-red-400 opacity-75"
                                        }`}
                                      >
                                        <CardHeader className="pb-3 pt-3 px-4">
                                          <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                              <CardTitle className="text-base">
                                                {service.name}
                                              </CardTitle>
                                              {service.description && (
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                  {service.description}
                                                </p>
                                              )}
                                              <div className="flex flex-wrap gap-1.5 mt-2">
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
                                            <div className="flex items-center gap-2 ml-4">
                                              <div className="flex items-center gap-1.5">
                                                <Label
                                                  htmlFor={`service-toggle-${service.id}`}
                                                  className="text-xs text-gray-600"
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
                                              <div className="flex gap-1">
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
                                                  onClick={() =>
                                                    handleDeleteService(service)
                                                  }
                                                  className="text-red-600 hover:text-red-700"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </CardHeader>
                                        <CardContent className="py-3 px-4">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                              <p className="text-xs font-medium text-gray-700">
                                                Durée par défaut
                                              </p>
                                              <p className="text-xs text-gray-600">
                                                {formatDuration(
                                                  service.duration
                                                )}
                                              </p>
                                            </div>
                                            {service.defaultOptions &&
                                              service.defaultOptions.length >
                                                0 && (
                                                <div>
                                                  <p className="text-xs font-medium text-gray-700 mb-1.5">
                                                    Options disponibles
                                                  </p>
                                                  <div className="flex flex-col lg:flex-row gap-1.5 lg:gap-2">
                                                    {service.defaultOptions.map(
                                                      (option) => (
                                                        <div
                                                          key={option.id}
                                                          className="flex items-center justify-between p-1.5 bg-gray-50 rounded flex-1 lg:flex-initial lg:min-w-[120px]"
                                                        >
                                                          <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium truncate">
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
                                                          </div>
                                                          <p className="text-xs font-semibold text-[#53745D] ml-2 flex-shrink-0">
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
                  onValueChange={(value: string) =>
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
                  onValueChange={(value: string) =>
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
                  onValueChange={(value: string) =>
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

        {/* Modal de modification/création de catégorie */}
        <Dialog
          open={!!editingCategory || creatingCategory}
          onOpenChange={handleCloseCategoryModal}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCategory
                  ? "Modifier la catégorie"
                  : "Créer une catégorie"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Modifiez les informations de la catégorie"
                  : "Remplissez les informations pour créer une nouvelle catégorie"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Nom */}
              <div className="space-y-2">
                <Label htmlFor="category-name">
                  Nom de la catégorie <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="category-name"
                  value={categoryFormData.name}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Nom de la catégorie"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  value={categoryFormData.description}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Description de la catégorie"
                  rows={3}
                />
              </div>

              {/* Icône */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="category-icon">Icône</Label>
                  <button
                    type="button"
                    onClick={() => setIsIconModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 p-1 transition-colors"
                    title="Voir les icônes disponibles"
                  >
                    <Info className="h-3 w-3 text-gray-600" />
                  </button>
                </div>
                <Input
                  id="category-icon"
                  value={categoryFormData.icon}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      icon: e.target.value,
                    })
                  }
                  disabled={true}
                  placeholder="Nom de l'icône (ex: scissors, hand)"
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  Cliquez sur l'icône d'information pour voir les icônes
                  disponibles
                </p>
              </div>

              {/* Actif */}
              <div className="flex items-center justify-between border-t pt-4">
                <div className="space-y-0.5">
                  <Label>Catégorie active</Label>
                  <p className="text-sm text-gray-500">
                    La catégorie est disponible et visible
                  </p>
                </div>
                <Switch
                  checked={categoryFormData.isActive}
                  onChange={(checked: boolean) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      isActive: checked,
                    })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCloseCategoryModal}
                disabled={isCreatingCategory}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmitCategory}
                disabled={isCreatingCategory}
              >
                {isCreatingCategory
                  ? editingCategory
                    ? "Enregistrement..."
                    : "Création..."
                  : editingCategory
                  ? "Enregistrer"
                  : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de sélection d'icône */}
        <Dialog open={isIconModalOpen} onOpenChange={setIsIconModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Icônes disponibles</DialogTitle>
              <DialogDescription>
                Sélectionnez une icône pour la catégorie. Cliquez sur une icône
                pour la sélectionner.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-4">
              {availableIcons.map((icon) => (
                <div
                  key={icon.name}
                  onClick={() => {
                    setCategoryFormData({
                      ...categoryFormData,
                      icon: icon.name,
                    });
                    setIsIconModalOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                    categoryFormData.icon === icon.name
                      ? "border-[#53745D] bg-[#F0F4F1]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <CategoryIcon
                    iconName={icon.name}
                    className="text-[#53745D] mb-2"
                    size={32}
                  />
                  <span className="text-xs text-center font-medium text-gray-700">
                    {icon.label}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {icon.name}
                  </span>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsIconModalOpen(false)}
              >
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
}
