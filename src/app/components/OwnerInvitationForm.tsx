"use client";

import { useGetServiceCategories } from "@/app/data/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DAYS, SALON_TYPES } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const ownerInvitationFormSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "Le prénom doit contenir au moins 2 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().email("Email invalide"),
    phone: z.string().optional(),
    indicatif: z.string().optional(),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
    salon: z.object({
      name: z.string().min(1, "Le nom est requis"),
      description: z.string().optional(),
      phone: z.string().min(1, "Le téléphone est requis"),
      email: z.string().email("Email invalide"),
      salonTypes: z
        .array(z.string())
        .min(1, "Au moins un type de salon est requis"),
      services: z.array(z.string()).optional(),
      offersHomeService: z.boolean().default(false),
      address: z.object({
        street: z.string().min(1, "La rue est requise"),
        city: z.string().min(1, "La ville est requise"),
        postalCode: z.string().optional(),
        country: z.string().min(1, "Le pays est requis"),
      }),
      openingHours: z.object({
        monday: z
          .object({
            open: z.string(),
            close: z.string(),
          })
          .nullable()
          .optional(),
        tuesday: z
          .object({
            open: z.string(),
            close: z.string(),
          })
          .nullable()
          .optional(),
        wednesday: z
          .object({
            open: z.string(),
            close: z.string(),
          })
          .nullable()
          .optional(),
        thursday: z
          .object({
            open: z.string(),
            close: z.string(),
          })
          .nullable()
          .optional(),
        friday: z
          .object({
            open: z.string(),
            close: z.string(),
          })
          .nullable()
          .optional(),
        saturday: z
          .object({
            open: z.string(),
            close: z.string(),
          })
          .nullable()
          .optional(),
        sunday: z
          .object({
            open: z.string(),
            close: z.string(),
          })
          .nullable()
          .optional(),
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type OwnerInvitationFormValues = z.infer<typeof ownerInvitationFormSchema>;

interface OwnerInvitationFormProps {
  invitation: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    indicatif?: string | null;
  };
  onSubmit: (values: OwnerInvitationFormValues, images?: File[]) => void;
  isSubmitting?: boolean;
}

export function OwnerInvitationForm({
  invitation,
  onSubmit,
  isSubmitting = false,
}: OwnerInvitationFormProps) {
  useGetServiceCategories();
  const [salonImages, setSalonImages] = useState<
    { file: File; preview: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<OwnerInvitationFormValues>({
    resolver: zodResolver(ownerInvitationFormSchema),
    defaultValues: {
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      email: invitation.email,
      phone: invitation.phone || "",
      indicatif: invitation.indicatif || "+1",
      password: "",
      confirmPassword: "",
      salon: {
        name: "",
        description: "",
        phone: invitation.phone || "",
        email: invitation.email,
        salonTypes: [],
        services: [],
        offersHomeService: false,
        address: {
          street: "",
          city: "",
          postalCode: "",
          country: "Canada",
        },
        openingHours: {
          monday: null,
          tuesday: { open: "09:00", close: "17:00" },
          wednesday: { open: "09:00", close: "17:00" },
          thursday: { open: "09:00", close: "17:00" },
          friday: { open: "09:00", close: "17:00" },
          saturday: { open: "09:00", close: "17:00" },
          sunday: null,
        },
      },
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setSalonImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setSalonImages((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (values: OwnerInvitationFormValues) => {
    // Passer les images au parent pour qu'elles soient uploadées après la création
    const imageFiles = salonImages.map((img) => img.file);
    onSubmit(values, imageFiles);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Informations utilisateur préremplies */}
        <Card>
          <CardHeader>
            <CardTitle>Vos informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Prénom" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="email@exemple.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="indicatif"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indicatif téléphonique</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="1234567890" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mot de passe */}
        <Card>
          <CardHeader>
            <CardTitle>Créer votre mot de passe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe *</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le mot de passe *</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Informations salon */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du salon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="salon.name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du salon *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nom du salon" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salon.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Description du salon"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salon.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone du salon *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+1 (514) 123-4567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salon.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email du salon *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="salon@example.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="salon.salonTypes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Types de salon *</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const current = field.value || [];
                      if (current.includes(value)) {
                        field.onChange(current.filter((v) => v !== value));
                      } else {
                        field.onChange([...current, value]);
                      }
                    }}
                    value={field.value?.[0] || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez les types" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SALON_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value?.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-1 bg-primary/10 text-primary rounded text-sm"
                      >
                        {SALON_TYPES.find((t) => t.value === type)?.label}
                      </span>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salon.address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse (rue) *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 rue Example" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="salon.address.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Montréal" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salon.address.postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code postal</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="H1A 1A1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salon.address.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="salon.offersHomeService"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Service à domicile
                    </FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Proposez-vous des services à domicile ?
                    </div>
                  </div>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onChange={(checked: boolean) => field.onChange(checked)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Horaires d'ouverture */}
        <Card>
          <CardHeader>
            <CardTitle>Horaires d'ouverture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Définissez les horaires d'ouverture de votre salon pour chaque
              jour de la semaine. Vous pourrez les modifier plus tard.
            </p>
            {DAYS.map((day) => {
              const dayValue = form.watch(
                `salon.openingHours.${day.key}` as any
              );
              const isEnabled = dayValue !== null && dayValue !== undefined;

              return (
                <div key={day.key} className="flex items-center gap-4">
                  <div className="w-24">
                    <label className="text-sm font-medium">{day.label}</label>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name={`salon.openingHours.${day.key}.open` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                              placeholder="09:00"
                              disabled={!isEnabled}
                              value={field.value || ""}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`salon.openingHours.${day.key}.close` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              {...field}
                              type="time"
                              placeholder="18:00"
                              disabled={!isEnabled}
                              value={field.value || ""}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name={`salon.openingHours.${day.key}` as any}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={isEnabled}
                            onChange={(checked: boolean) => {
                              if (checked) {
                                field.onChange({
                                  open: "09:00",
                                  close: "18:00",
                                });
                              } else {
                                field.onChange(null);
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Photos du salon */}
        <Card>
          <CardHeader>
            <CardTitle>Photos du salon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ajoutez des photos de votre salon pour le présenter à vos clients.
              Vous pourrez en ajouter d'autres après la création de votre
              compte.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {salonImages.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                >
                  <Image
                    src={image.preview}
                    alt={`Photo du salon ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {salonImages.length < 8 && (
                <div
                  className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500 text-center px-2">
                    Ajouter une photo
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {salonImages.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {salonImages.length} photo(s) sélectionnée(s). Les photos seront
                uploadées après la création de votre salon.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Création en cours..."
              : "Créer mon compte et mon salon"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
