"use client";

import { GET_USERS } from "@/shared/constantes";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import {
  CheckCircle,
  DollarSign,
  Globe,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  Plane,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRegisterUser, useUpdateUser } from "../../data/hooks";
// import { useDropzone } from "react-dropzone";

import android from "@/assets/photos/android.png";
import apple from "@/assets/photos/apple.png";

import { Button } from "@/components/ui/button";
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

import { Checkbox } from "@/components/ui/checkbox";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import Image from "next/image";

// Le schema mis à jour avec les nouveaux champs
const formSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
  phone: z.string().optional(),
  role: z.string(),
  language: z.string(),
  preferredCurrency: z.string().default("CAD"),
  isTraveler: z.boolean().default(false),
  profilePicture: z.string().optional(),
  addressNumber: z.number().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FormAddUser({
  mode,
  setOpen,
  isUpdate,
  setIsUpdate,
  dataSelected,
}: {
  mode?: string;
  setOpen?: (value: boolean) => void;
  isUpdate?: boolean;
  setIsUpdate?: (value: boolean) => void;
  dataSelected?: any | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("personal");

  const [loading, setLoading] = useState(false);
  const [showAppDownload, setShowAppDownload] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [, setProfileImage] = useState<string | null>(
    dataSelected?.profilePicture || null
  );

  const [openModalInfo, setOpenModalInfo] = useState(false);

  const { mutate: updateUser } = useUpdateUser();
  const { mutate: createUserMutate } = useRegisterUser();

  // Configuration de l'upload d'image de profil
  // const { getRootProps, getInputProps } = useDropzone({
  //   accept: {
  //     "image/*": [".jpeg", ".png", ".jpg"],
  //   },
  //   maxFiles: 1,
  //   onDrop: (acceptedFiles) => {
  //     const file = acceptedFiles[0];
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       setProfileImage(reader.result as string);
  //       form.setValue("profilePicture", reader.result as string);
  //     };
  //     reader.readAsDataURL(file);
  //   },
  // });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: dataSelected?.firstName || "",
      lastName: dataSelected?.lastName || "",
      email: dataSelected?.email || "",
      password: "",
      phone: dataSelected?.phone || "",
      role: dataSelected?.role || "USER",
      language: "FR",
      preferredCurrency: dataSelected?.preferredCurrency || "CAD",
      isTraveler: dataSelected?.role === "TRAVELER" || false,
      profilePicture: dataSelected?.profilePicture || "",
      addressNumber: dataSelected?.addressNumber || undefined,
      address: dataSelected?.address || "",
      city: dataSelected?.city || "",
      postalCode: dataSelected?.postalCode || "",
      country: dataSelected?.country || "",
    },
  });

  // useEffect pour réinitialiser le formulaire
  useEffect(() => {
    if (!dataSelected) {
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        role: "USER",
        language: "FR",
        preferredCurrency: "CAD",
        isTraveler: false,
        profilePicture: "",
        addressNumber: undefined,
        address: "",
        city: "",
        postalCode: "",
        country: "",
      });
      setProfileImage(null);
    } else if (isUpdate) {
      form.reset({
        firstName: dataSelected.firstName || "",
        lastName: dataSelected.lastName || "",
        email: dataSelected.email || "",
        password: "",
        phone: dataSelected.phone || "",
        role: dataSelected.role || "USER",
        preferredCurrency: dataSelected.preferredCurrency || "CAD",
        isTraveler: dataSelected.role === "TRAVELER" || false,
        profilePicture: dataSelected.profilePicture || "",
        addressNumber: dataSelected.addressNumber || undefined,
        address: dataSelected.address || "",
        city: dataSelected.city || "",
        postalCode: dataSelected.postalCode || "",
        country: dataSelected.country || "",
      });
      setProfileImage(dataSelected.profilePicture || null);
    }
  }, [dataSelected, isUpdate, form]);

  // Gestion du rôle traveler
  const watchTraveler = form.watch("isTraveler");

  useEffect(() => {
    // Mettre à jour le rôle quand isTraveler change
    if (watchTraveler) {
      form.setValue("role", "TRAVELER");
    } else if (form.getValues("role") === "TRAVELER") {
      form.setValue("role", "USER");
    }
  }, [watchTraveler, form]);

  // Fonction submit mise à jour
  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      // Définir le rôle en fonction de l'option voyageur
      const finalValues = {
        ...values,
        role: values.isTraveler ? "TRAVELER" : values.role,
      };

      if (isUpdate) {
        await updateUser(
          { id: dataSelected?.id, data: finalValues },
          {
            onSuccess: () => {
              message.success("Utilisateur mis à jour avec succès!");
              queryClient.invalidateQueries({ queryKey: [GET_USERS] });
              setOpen?.(false);
              form.reset();
            },
          }
        );
      } else {
        await createUserMutate(finalValues, {
          onSuccess: async () => {
            setRegisterSuccess(true);
            message.success("Compte créé avec succès!");
            // setShowAppDownload(true);
            setOpenModalInfo(true);
            router.push("/auth/signin");

            queryClient.invalidateQueries({ queryKey: [GET_USERS] });
            setOpen?.(false);
            form.reset();
          },
        });
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
      message.error("Une erreur est survenue");
      setRegisterSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const continueToApp = () => {
    setIsNavigating(true);
    setShowAppDownload(false);
    setTimeout(() => {
      if (registerSuccess) {
        window.location.href = "/admin/dashboard";
      }
    }, 300);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto overflow-hidden border shadow-md">
      <Dialog
        open={openModalInfo}
        onOpenChange={(open) => {
          if (!open) {
            setOpenModalInfo(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-lg">
          <div className="bg-gradient-to-r from-teal-600 to-indigo-700 p-8">
            <DialogHeader className="items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mx-auto rounded-full bg-white/20 p-4 w-20 h-20 flex items-center justify-center mb-6"
              >
                <CheckCircle className="h-12 w-12 text-white" />
              </motion.div>
              <DialogTitle className="text-center text-white text-3xl font-bold">
                Félicitations !
              </DialogTitle>
              <p className="text-center text-white/90 mt-3 text-lg">
                Votre compte a été créé avec succès
              </p>
            </DialogHeader>
          </div>

          <div className="py-8 px-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="text-center"
            >
              <p className="text-red-800 text-center">
                <strong>Important :</strong> Un e-mail de confirmation a été
                envoyé à votre adresse {form.getValues("email")}. Veuillez
                cliquer sur le lien dans cet e-mail pour activer votre compte.
                Pensez à vérifier vos dossiers de spam si vous ne le trouvez
                pas.
              </p>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
      <CardHeader className="bg-gradient-to-r from-teal-300 to-teal-500 p-6">
        <CardTitle className="text-2xl font-bold">
          {isUpdate
            ? "Modifier un utilisateur"
            : mode === "admin"
              ? "Ajouter un utilisateur"
              : "Créer votre compte"}
        </CardTitle>
        <p className="mt-1">
          {isUpdate
            ? "Mettez à jour les informations de l'utilisateur"
            : "Remplissez les informations pour créer un nouveau compte"}
        </p>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs
          defaultValue="personal"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b">
            <TabsList className="w-full h-auto p-0 bg-transparent">
              <TabsTrigger
                value="personal"
                className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:shadow-none transition-all"
              >
                <User className="h-4 w-4 mr-2" />
                Infos. personnelles
              </TabsTrigger>
              {/* <TabsTrigger
                value="company"
                className="flex-1 py-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-teal-600 data-[state=active]:shadow-none transition-all"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Infos de l&apos;entreprise
              </TabsTrigger> */}
            </TabsList>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="personal" className="p-6 mt-0 space-y-6">
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4 text-teal-500" /> Prénom
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Prénom"
                            {...field}
                            className="h-10"
                          />
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
                        <FormLabel className="flex items-center gap-2">
                          <User className="h-4 w-4 text-teal-500" /> Nom
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nom"
                            {...field}
                            className="h-10"
                          />
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
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-teal-500" /> Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Email"
                            {...field}
                            className="h-10"
                          />
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
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-teal-500" /> Téléphone
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="Téléphone"
                            {...field}
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="addressNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-teal-500" /> Numéro de
                          rue
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Numéro de rue"
                            value={field.value || ""}
                            onChange={(e) => {
                              // Convertir la valeur en nombre ou undefined si vide
                              const value =
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value);
                              field.onChange(value);
                            }}
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-teal-500" /> Adresse
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Adresse"
                            {...field}
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-teal-500" /> Ville
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ville"
                            {...field}
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isUpdate && (
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-teal-500" /> Mot de
                            passe
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Mot de passe"
                              {...field}
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-teal-500" /> Langue
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Sélectionnez une langue" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FR">Français</SelectItem>
                            <SelectItem value="EN">English</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Devise préférée */}
                  <FormField
                    control={form.control}
                    name="preferredCurrency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-teal-500" />{" "}
                          Devise préférée
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Sélectionnez une devise" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CAD">
                              Dollar canadien (CAD)
                            </SelectItem>
                            <SelectItem value="USD">
                              Dollar américain (USD)
                            </SelectItem>
                            <SelectItem value="EUR">Euro (EUR)</SelectItem>
                            <SelectItem value="GBP">
                              Livre sterling (GBP)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Option pour être voyageur */}
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                  <FormField
                    control={form.control}
                    name="isTraveler"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-medium flex items-center">
                            <Plane className="h-4 w-4 mr-2 text-teal-600" />
                            Je souhaite aussi être voyageur
                          </FormLabel>
                          <FormDescription className="text-xs">
                            En tant que voyageur, vous pourrez transporter des
                            colis et gagner un revenu supplémentaire.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {mode !== "admin" ? (
                <div className="flex justify-end items-center mr-10 pt-4 border-t mt-6">
                  <div className="flex-end items-center space-x-4">
                    <Button type="submit" disabled={loading} size="lg">
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isUpdate ? "Mettre à jour" : "S'inscrire"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="pt-4 border-t mt-6">
                    <div className="flex-end items-center space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          form.reset();
                          setOpen?.(false);
                          setIsUpdate?.(false);
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                    <div className="flex lg:justify-end mt-4 w-full space-x-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="lg:w-1/2 w-full lg:-mt-14"
                      >
                        {loading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isUpdate ? "Mettre à jour" : "S'inscrire"}
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {mode !== "admin" && (
                <div className="mt-4 px-10 pb-10">
                  <p className="text-sm text-muted-foreground">
                    En créant un compte, vous acceptez les{" "}
                    <Link
                      href="/terms"
                      className="text-teal-600 hover:underline"
                    >
                      conditions d&apos;utilisation
                    </Link>{" "}
                    et la{" "}
                    <Link
                      href="/privacy"
                      className="text-teal-600 hover:underline"
                    >
                      politique de confidentialité
                    </Link>
                    .
                  </p>
                </div>
              )}
            </form>
          </Form>
        </Tabs>
      </CardContent>

      {/* Modale pour télécharger les applications */}
      <Dialog
        open={showAppDownload}
        onOpenChange={(open) => {
          if (!open && registerSuccess) {
            setIsNavigating(true);
            setTimeout(() => {
              window.location.href = "/admin/dashboard";
            }, 300);
          }
          setShowAppDownload(open);
        }}
      >
        <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden rounded-lg">
          <div className="bg-gradient-to-r from-teal-600 to-indigo-700 p-8">
            <DialogHeader className="items-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mx-auto rounded-full bg-white/20 p-4 w-20 h-20 flex items-center justify-center mb-6"
              >
                <CheckCircle className="h-12 w-12 text-white" />
              </motion.div>
              <DialogTitle className="text-center text-white text-3xl font-bold">
                Félicitations !
              </DialogTitle>
              <p className="text-center text-white/90 mt-3 text-lg">
                Votre compte a été créé avec succès
              </p>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h3 className="font-semibold text-xl">
                Accédez à Kori en déplacement
              </h3>
              <p className="text-muted-foreground mt-2">
                Téléchargez notre application pour gérer vos livraisons où que
                vous soyez
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="transform hover:scale-105 transition-transform duration-300"
              >
                <Image
                  width={180}
                  height={60}
                  src={apple}
                  alt="Télécharger sur App Store"
                  className="h-14"
                />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="transform hover:scale-105 transition-transform duration-300"
              >
                <Image
                  width={180}
                  height={60}
                  src={android}
                  alt="Télécharger sur Google Play"
                  className="h-14"
                />
              </a>
            </motion.div>

            <motion.div
              className="bg-amber-50 rounded-xl p-5 border border-amber-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-amber-800 text-center">
                <strong>Conseil Pro :</strong> Pour accéder à toutes les
                fonctionnalités avancées comme le suivi de colis et la gestion
                des livraisons, utilisez la version web complète de Kori.
              </p>
            </motion.div>

            <motion.div
              className="flex justify-center pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                onClick={continueToApp}
                className="w-full sm:w-auto px-8 py-6 h-auto text-lg bg-gradient-to-r from-teal-600 to-indigo-700 hover:from-teal-700 hover:to-indigo-800"
                disabled={isNavigating}
              >
                {isNavigating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  "Accéder au tableau de bord"
                )}
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loader plein écran pendant la navigation */}
      {isNavigating && mode !== "admin" && (
        <div className="fixed inset-0 bg-gradient-to-r from-teal-600/90 to-indigo-700/90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 max-w-md w-full flex flex-col items-center space-y-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1.5,
              }}
            >
              <Loader2 className="h-16 w-16 animate-spin text-white" />
            </motion.div>
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-white">
                Préparation de votre espace
              </h2>
              <p className="text-white/80">
                Nous configurons votre tableau de bord personnalisé...
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
