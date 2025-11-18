"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const userFormSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional().or(z.literal("")),
  indicatif: z.string().optional().or(z.literal("")),
  role: z.enum(["ADMIN", "OWNER", "CLIENT", "EMPLOYEE", "SYSTEM"]),
  isActive: z.boolean(),
  password: z.string().optional().or(z.literal("")),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  indicatif?: string;
  role: "ADMIN" | "OWNER" | "CLIENT" | "EMPLOYEE" | "SYSTEM";
  isActive: boolean;
  isEmailVerified?: boolean;
}

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSubmit: (values: UserFormValues & { id?: string }) => Promise<void>;
}

export function UserModal({
  open,
  onOpenChange,
  user,
  onSubmit,
}: UserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!user;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      indicatif: "",
      role: "CLIENT",
      isActive: true,
      password: "",
    },
  });

  // Mettre à jour le formulaire quand l'utilisateur change
  useEffect(() => {
    if (user && open) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        indicatif: user.indicatif || "",
        role: user.role || "CLIENT",
        isActive: user.isActive ?? true,
        password: "", // Ne pas pré-remplir le mot de passe
      });
    } else if (!user && open) {
      // Réinitialiser pour la création
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        indicatif: "",
        role: "CLIENT",
        isActive: true,
        password: "",
      });
    }
  }, [user, open, form]);

  const handleSubmit = async (values: UserFormValues) => {
    try {
      setIsSubmitting(true);
      const submitData: any = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        role: values.role,
        isActive: values.isActive,
      };

      // Ajouter les champs optionnels seulement s'ils ne sont pas vides
      if (values.phone && values.phone.trim()) {
        submitData.phone = values.phone.trim();
      }
      if (values.indicatif && values.indicatif.trim()) {
        submitData.indicatif = values.indicatif.trim();
      }

      // Si on est en mode édition, inclure l'ID
      if (isEditMode && user) {
        submitData.id = user.id;
      }

      // Gestion du mot de passe
      if (isEditMode) {
        // En mode édition, le mot de passe est optionnel
        if (values.password && values.password.trim()) {
          submitData.password = values.password.trim();
        }
      } else {
        // En mode création, le mot de passe est requis
        if (!values.password || !values.password.trim()) {
          form.setError("password", {
            type: "manual",
            message: "Le mot de passe est requis",
          });
          setIsSubmitting(false);
          return;
        }
        submitData.password = values.password.trim();
      }

      await onSubmit(submitData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Modifier l'utilisateur" : "Créer un utilisateur"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom" {...field} />
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
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@exemple.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="indicatif"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indicatif téléphonique</FormLabel>
                    <FormControl>
                      <Input placeholder="+1" {...field} />
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
                      <Input placeholder="1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un rôle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CLIENT">Client</SelectItem>
                        <SelectItem value="OWNER">Propriétaire</SelectItem>
                        <SelectItem value="EMPLOYEE">Employé</SelectItem>
                        <SelectItem value="ADMIN">Administrateur</SelectItem>
                        <SelectItem value="SYSTEM">Système</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Statut</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        {field.value
                          ? "Utilisateur actif"
                          : "Utilisateur inactif"}
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
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mot de passe{" "}
                    {isEditMode && "(laisser vide pour ne pas modifier)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        isEditMode ? "Nouveau mot de passe" : "Mot de passe"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "En cours..."
                  : isEditMode
                  ? "Modifier"
                  : "Créer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
