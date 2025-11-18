"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import PageWrapper from "@/app/components/block/PageWrapper";
import {
  useGetBookings,
  useGetClientBookings,
  useGetMe,
  useUpdateUserProfile,
} from "@/app/data/hooks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingStatusBadge, PaymentStatusBadge } from "@/utils/statusUtils";
import dayjs from "dayjs";
import {
  Building2,
  Calendar,
  ChevronDownIcon,
  Clock,
  CreditCard,
  EditIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
  VerifiedIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional().or(z.literal("")),
  indicatif: z.string().optional().or(z.literal("")),
  timezone: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.null()),
  bio: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export default function AccountPage() {
  useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Utiliser useGetMe pour récupérer l'utilisateur connecté
  const {
    data: userData,
    isLoading: loadingUser,
    error: userError,
  } = useGetMe();
  const user = userData?.data || userData;

  // ✅ Utiliser useUpdateUserProfile pour mettre à jour le profil
  const { mutate: updateUserProfile, isPending: isUpdating } =
    useUpdateUserProfile();

  // ✅ Récupérer les bookings du client
  const { data: clientBookingsData, isLoading: loadingBookings } =
    useGetClientBookings(user?.id || "", { limit: 10 });

  // ✅ Récupérer tous les bookings pour les paiements
  const { data: bookingsData, isLoading: loadingPayments } = useGetBookings({
    clientId: user?.id,
    limit: 20,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      indicatif: "",
      timezone: "",
      gender: null,
      bio: "",
    },
  });

  // ✅ Mettre à jour le formulaire quand l'utilisateur est chargé
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        indicatif: user?.indicatif || "",
        timezone: user?.timezone || "",
        gender: user?.gender || null,
        bio: user?.bio || "",
      });
    }
  }, [user, form]);

  // ✅ États de chargement améliorés
  if (loadingUser) {
    return (
      <PageWrapper title="Mon Compte">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  // ✅ Gestion d'erreur
  if (userError) {
    return (
      <PageWrapper title="Mon Compte">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-red-500 mb-4">
                  Erreur lors du chargement de votre profil. Veuillez rafraîchir
                  la page.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => window.location.reload()}>
                    Rafraîchir
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/auth/signin")}
                  >
                    Se connecter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  // ✅ Si pas d'utilisateur après chargement, afficher un message
  if (!user && !loadingUser) {
    return (
      <PageWrapper title="Mon Compte">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-gray-500 mb-4">
                  Vous devez être connecté pour accéder à cette page
                </p>
                <Button onClick={() => router.push("/auth/signin")}>
                  Se connecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  const onSubmit = async (data: FormValues) => {
    try {
      // ✅ Utiliser updateUserProfile avec la bonne structure
      updateUserProfile(
        {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone || undefined,
          indicatif: data.indicatif || undefined,
          timezone: data.timezone || undefined,
          gender: data.gender || undefined,
          bio: data.bio || undefined,
        },
        {
          onSuccess: () => {
            setIsEditing(false);
          },
        }
      );
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleEdit = () => {
    if (user) {
      form.reset({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        indicatif: user?.indicatif || "",
        timezone: user?.timezone || "",
        gender: user?.gender || null,
        bio: user?.bio || "",
      });
    }
    setIsEditing(true);
  };

  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string | null | undefined;
  }) => (
    <div className="flex items-center space-x-4 py-2">
      <Icon className="h-5 w-5 text-gray-500" />
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-base">{value || "Non renseigné"}</p>
      </div>
    </div>
  );

  return (
    <PageWrapper title="Mon Compte">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-10">
          {/* En-tête de la carte */}
          <CardHeader className="flex justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <AvatarFallback className="bg-[#F0F4F1] text-[#53745D] text-xl">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <div>
                    {user?.firstName} {user?.lastName}{" "}
                  </div>
                  <div>
                    {user?.isEmailVerified && (
                      <VerifiedIcon className="text-green-500 size-5" />
                    )}{" "}
                  </div>
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={user?.isActive ? "default" : "destructive"}>
                    {user?.isActive ? "Actif" : "Inactif"}
                  </Badge>
                  <Badge variant="outline">{user?.role}</Badge>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex items-center space-x-2"
            >
              <EditIcon className="h-4 w-4" />
              <span>Modifier</span>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-0">
                <InfoRow
                  icon={UserIcon}
                  label="Nom complet"
                  value={`${user?.firstName || ""} ${user?.lastName || ""}`}
                />
                <InfoRow
                  icon={MailIcon}
                  label="Email"
                  value={user?.email || ""}
                />
                <InfoRow
                  icon={PhoneIcon}
                  label="Téléphone"
                  value={
                    user?.indicatif && user?.phone
                      ? `${user.phone}`
                      : user?.phone || ""
                  }
                />
                {user?.timezone && (
                  <InfoRow
                    icon={Clock}
                    label="Fuseau horaire"
                    value={user.timezone}
                  />
                )}
                {user?.gender && (
                  <InfoRow
                    icon={UserIcon}
                    label="Genre"
                    value={
                      user.gender === "MALE"
                        ? "Homme"
                        : user.gender === "FEMALE"
                        ? "Femme"
                        : "Autre"
                    }
                  />
                )}
              </div>
              <div className="space-y-0">
                {user?.address && (
                  <InfoRow
                    icon={Building2}
                    label="Adresse"
                    value={
                      user.address.street
                        ? `${user.address.street}, ${user.address.city || ""} ${
                            user.address.postalCode || ""
                          }`
                        : user.address.city || ""
                    }
                  />
                )}
                {user?.preferences && (
                  <>
                    <InfoRow
                      icon={Calendar}
                      label="Langue"
                      value={
                        user.preferences.language === "fr"
                          ? "Français"
                          : user.preferences.language === "en"
                          ? "English"
                          : user.preferences.language
                      }
                    />
                    <InfoRow
                      icon={CreditCard}
                      label="Devise"
                      value={user.preferences.defaultCurrency || "CAD"}
                    />
                  </>
                )}
                {user?.bio && (
                  <div className="py-2">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Biographie
                    </p>
                    <p className="text-base">{user.bio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Liste des réservations */}
            <div className="border-t pt-4">
              <Collapsible>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold mb-2">
                    Vos Réservations (
                    {clientBookingsData?.bookings?.length || 0})
                  </h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  {loadingBookings ? (
                    <div className="space-y-2 p-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : clientBookingsData?.bookings &&
                    clientBookingsData.bookings.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden mt-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Salon</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="hidden md:table-cell">
                              Montant
                            </TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientBookingsData.bookings.map((booking: any) => (
                            <TableRow key={booking.id}>
                              <TableCell>
                                <div className="font-medium">
                                  {booking.salon?.name || "N/A"}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {dayjs(
                                    booking.appointmentStartDateTime
                                  ).format("DD MMM YYYY")}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {dayjs(
                                    booking.appointmentStartDateTime
                                  ).format("HH:mm")}
                                </div>
                              </TableCell>
                              <TableCell>
                                <BookingStatusBadge status={booking.status} />
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {booking.payment?.total
                                  ? `${(booking.payment.total / 100).toFixed(
                                      2
                                    )} ${
                                      user?.preferences?.defaultCurrency ||
                                      "CAD"
                                    }`
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    router.push(
                                      `/admin/bookings/${booking.id}`
                                    );
                                  }}
                                >
                                  Détails
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center p-6 border border-dashed rounded-lg mt-2">
                      <p className="text-gray-500">
                        Aucune réservation trouvée.
                      </p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Liste des paiements */}
            <div className="border-t pt-4">
              <Collapsible>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold mb-2">
                    Vos Paiements (
                    {bookingsData?.data?.filter((b: any) => b.payment).length ||
                      0}
                    )
                  </h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  {loadingPayments ? (
                    <div className="space-y-2 p-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : bookingsData?.data?.filter((b: any) => b.payment).length >
                    0 ? (
                    <div className="border rounded-lg overflow-hidden mt-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Montant</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="hidden md:table-cell">
                              Réservation
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                              Date
                            </TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bookingsData.data
                            .filter((booking: any) => booking.payment)
                            .map((booking: any) => {
                              const payment = booking.payment;
                              return (
                                <TableRow key={payment.id}>
                                  <TableCell>
                                    <div className="font-medium">
                                      {payment.total
                                        ? `${(payment.total / 100).toFixed(
                                            2
                                          )} ${
                                            user?.preferences
                                              ?.defaultCurrency || "CAD"
                                          }`
                                        : "-"}
                                    </div>
                                    {payment.platformFee > 0 && (
                                      <div className="text-xs text-gray-500">
                                        Frais:{" "}
                                        {(payment.platformFee / 100).toFixed(2)}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <PaymentStatusBadge
                                      status={
                                        payment.paymentStatus || "PENDING"
                                      }
                                    />
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <Button
                                      variant="link"
                                      className="p-0 h-auto"
                                      onClick={() => {
                                        router.push(
                                          `/admin/bookings/${booking.id}`
                                        );
                                      }}
                                    >
                                      Voir réservation
                                    </Button>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">
                                    <span className="text-sm text-gray-600">
                                      {payment.paidAt
                                        ? dayjs(payment.paidAt).format(
                                            "DD MMM YYYY"
                                          )
                                        : dayjs(payment.createdAt).format(
                                            "DD MMM YYYY"
                                          )}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        router.push(
                                          `/admin/bookings/${booking.id}`
                                        );
                                      }}
                                    >
                                      Détails
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center p-6 border border-dashed rounded-lg mt-2">
                      <p className="text-gray-500">Aucun paiement trouvé.</p>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Informations du compte */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Informations du compte</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow
                  icon={Calendar}
                  label="Date de création"
                  value={
                    user?.createdAt
                      ? dayjs(user.createdAt).format("DD MMM YYYY")
                      : ""
                  }
                />
                <InfoRow
                  icon={Clock}
                  label="Dernière mise à jour"
                  value={
                    user?.updatedAt
                      ? dayjs(user.updatedAt).format("DD MMM YYYY")
                      : ""
                  }
                />
                {user?.lastLogin && (
                  <InfoRow
                    icon={Clock}
                    label="Dernière connexion"
                    value={dayjs(user.lastLogin).format("DD MMM YYYY à HH:mm")}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier mon profil</DialogTitle>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Informations personnelles */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Informations personnelles
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
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
                            <Input {...field} value={field.value ?? ""} />
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
                          <Input type="email" {...field} />
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
                          <FormLabel>Indicatif</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              placeholder="+1"
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
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuseau horaire</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="America/Toronto"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Genre</FormLabel>
                        <Select
                          onValueChange={(value: string) =>
                            field.onChange(
                              value === "null"
                                ? null
                                : (value as "MALE" | "FEMALE" | "OTHER")
                            )
                          }
                          value={field.value || "null"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un genre" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="null">Non spécifié</SelectItem>
                            <SelectItem value="MALE">Homme</SelectItem>
                            <SelectItem value="FEMALE">Femme</SelectItem>
                            <SelectItem value="OTHER">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Biographie</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Votre biographie"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? "Mise à jour..." : "Sauvegarder"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </PageWrapper>
  );
}
