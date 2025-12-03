"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { DAYS, SALON_TYPES, TIMEZONES } from "@/utils/constants";

const salonFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  phone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email("Email invalide"),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  salonTypes: z
    .array(z.string())
    .min(1, "Au moins un type de salon est requis"),
  timezone: z.string().min(1, "Le fuseau horaire est requis"),
  offersHomeService: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  address: z.object({
    street: z.string().min(1, "La rue est requise"),
    city: z.string().min(1, "La ville est requise"),
    postalCode: z.string().optional(),
    province: z.string().optional(),
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
});

export type SalonFormValues = z.infer<typeof salonFormSchema>;

interface SalonFormProps {
  salon?: any;
  onSubmit: (values: SalonFormValues) => void;
  isSubmitting?: boolean;
}

export function SalonForm({
  salon,
  onSubmit,
  isSubmitting = false,
}: SalonFormProps) {
  const form = useForm<SalonFormValues>({
    resolver: zodResolver(salonFormSchema),
    defaultValues: {
      name: "",
      description: "",
      phone: "",
      email: "",
      website: "",
      salonTypes: [],
      timezone: "America/Toronto",
      offersHomeService: false,
      isActive: true,
      isVerified: false,
      address: {
        street: "",
        city: "",
        postalCode: "",
        province: "",
        country: "Canada",
      },
      openingHours: {
        monday: null,
        tuesday: null,
        wednesday: null,
        thursday: null,
        friday: null,
        saturday: null,
        sunday: null,
      },
    },
  });

  useEffect(() => {
    if (salon) {
      form.reset({
        name: salon.name || "",
        description: salon.description || "",
        phone: salon.phone || "",
        email: salon.email || "",
        website: salon.website || "",
        salonTypes: salon.salonTypes || [],
        timezone: salon.timezone || "America/Toronto",
        offersHomeService: salon.offersHomeService || false,
        isActive: salon.isActive !== undefined ? salon.isActive : true,
        isVerified: salon.isVerified !== undefined ? salon.isVerified : false,
        address: {
          street: salon.address?.street || "",
          city: salon.address?.city || "",
          postalCode: salon.address?.postalCode || "",
          province: salon.address?.province || "",
          country: salon.address?.country || "Canada",
        },
        openingHours: salon.openingHours || {
          monday: null,
          tuesday: null,
          wednesday: null,
          thursday: null,
          friday: null,
          saturday: null,
          sunday: null,
        },
      });
    }
  }, [salon, form]);

  const handleSubmit = async (values: SalonFormValues) => {
    // Nettoyer les valeurs
    const submitData: any = {
      ...values,
      website: values.website || undefined,
      description: values.description || undefined,
      address: {
        ...values.address,
        province: values.address.province || undefined,
      },
      openingHours: Object.fromEntries(
        Object.entries(values.openingHours).map(([key, value]) => [
          key,
          value || null,
        ])
      ),
    };

    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
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
              name="description"
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+1 (514) 123-4567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site web</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      placeholder="https://www.example.com"
                    />
                  </FormControl>
                  <FormDescription>
                    URL du site web du salon (optionnel)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salonTypes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">
                      Types de salon *
                    </FormLabel>
                    <FormDescription>
                      Sélectionnez au moins un type de salon
                    </FormDescription>
                  </div>
                  {SALON_TYPES.map((type) => (
                    <FormField
                      key={type.value}
                      control={form.control}
                      name="salonTypes"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={type.value}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(type.value)}
                                onChange={(checked: boolean) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        type.value,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value: string) =>
                                            value !== type.value
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {type.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Adresse */}
        <Card>
          <CardHeader>
            <CardTitle>Adresse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rue *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="123 Rue Example" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address.city"
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
                name="address.postalCode"
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
            </div>

            {/* Coordonnées géographiques (lecture seule) */}
            {salon?.address?.latitude && salon?.address?.longitude && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input
                      value={salon.address.latitude}
                      disabled
                      className="bg-gray-50"
                    />
                  </FormControl>
                </FormItem>
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input
                      value={salon.address.longitude}
                      disabled
                      className="bg-gray-50"
                    />
                  </FormControl>
                </FormItem>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address.province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Québec" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Canada" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Horaires d'ouverture */}
        <Card>
          <CardHeader>
            <CardTitle>Horaires d'ouverture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {DAYS.map((day) => {
              const dayValue = form.watch(`openingHours.${day.key}` as any);
              const isEnabled = dayValue !== null && dayValue !== undefined;

              return (
                <div key={day.key} className="flex items-center gap-4">
                  <div className="w-24">
                    <label className="text-sm font-medium">{day.label}</label>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name={`openingHours.${day.key}.open` as any}
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
                      name={`openingHours.${day.key}.close` as any}
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
                    name={`openingHours.${day.key}` as any}
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

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuseau horaire *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un fuseau horaire" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="offersHomeService"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Service à domicile
                      </FormLabel>
                      <FormDescription>
                        Le salon propose des services à domicile
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Actif</FormLabel>
                      <FormDescription>
                        Le salon est actif et visible
                      </FormDescription>
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

              <FormField
                control={form.control}
                name="isVerified"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Vérifié</FormLabel>
                      <FormDescription>
                        Le salon a été vérifié par l'administration
                      </FormDescription>
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
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Enregistrement..."
              : salon
              ? "Mettre à jour"
              : "Créer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
