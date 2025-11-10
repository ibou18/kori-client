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
  BadgeDollarSign,
  CheckCircleIcon,
  ChevronDownIcon,
  EditIcon,
  MailIcon,
  PhoneIcon,
  QrCodeIcon,
  UserIcon,
  VerifiedIcon,
} from "lucide-react";
import Image from "next/image";

import { IDelivery, IPackage } from "@/app/interfaceHop";

import {
  useDeliveryStatusBadge,
  usePaymentStatusBadge,
} from "@/app/hooks/useDeliveryStatus";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingStatusBadge } from "@/utils/statusUtils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const formSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  address: z.string().min(5, "Adresse invalide"),
  city: z.string().min(2, "Ville invalide"),
  postalCode: z.string().min(5, "Code postal invalide"),
  country: z.string().min(2, "Pays invalide"),
  preferredCurrency: z.enum(["CAD", "USD", "EUR", "GBP"]),
  company: z.string().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AccountPage() {
  const { data: session }: any = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const { getPaymentStatusBadge } = usePaymentStatusBadge();
  const { getDeliveryStatusBadge } = useDeliveryStatusBadge();

  // ✅ Utiliser useGetMe pour récupérer l'utilisateur connecté
  const { data: user, isLoading: loadingUser, error: userError } = useGetMe();

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
      address: "",
      city: "",
      postalCode: "",
      preferredCurrency: "CAD",
      company: "",
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
        address: user?.address || "",
        city: user?.city || "",
        postalCode: user?.postalCode || "",
        preferredCurrency: (user?.preferredCurrency as any) || "CAD",
        company: user?.company || "",
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

  // ✅ Gestion d'erreur - Ne pas bloquer si user est null mais pas d'erreur (peut être en chargement)
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
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
          preferredCurrency: data.preferredCurrency,
          company: data.company,
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
        address: "",
        city: "",
        postalCode: "",
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
      {typeof Icon === "function" ? (
        Icon()
      ) : (
        <Icon className="h-5 w-5 text-gray-500" />
      )}
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-base">{value || "Non renseigné"}</p>
      </div>
    </div>
  );

  const handleConnectDashboard = async () => {
    try {
      // TODO: Implémenter l'API pour récupérer le lien Stripe Connect
      toast.info("Fonctionnalité en cours de développement");
    } catch (error) {
      toast.error(
        "Une erreur est survenue lors de l'accès au dashboard Stripe"
      );
    }
  };

  return (
    <PageWrapper title="Mon Compte">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-10">
          <div className="border-b p-6">
            {/* <ImageUpload
              onUpload={handleLogoUpload}
              isLoading={isLoading}
              currentImage={user?.company?.logo}
            /> */}
          </div>

          {/* En-tête de la carte */}
          {/* Ajout d'une section pour le compte Stripe (pour les voyageurs) */}
          {user?.role === "TRAVELER" && (
            <div className="border-t pt-4">
              <div className="bg-gray-50 rounded-lg p-4 border mx-5">
                <div className="flex items-center justify-between ">
                  <div className="">
                    <p className="text-sm text-gray-600 mb-1 ">
                      {user?.hasStripeConnectAccount
                        ? "Votre compte Stripe est actif et prêt à recevoir des paiements."
                        : "Vous devez configurer votre compte Stripe pour recevoir des paiements en tant que voyageur."}
                    </p>
                    <div className="flex items-center mt-2 ">
                      <Badge
                        variant={
                          user?.hasStripeConnectAccount ? "success" : "outline"
                        }
                        className="mr-2"
                      >
                        {user?.hasStripeConnectAccount
                          ? "Compte configuré"
                          : "Configuration requise"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={handleConnectDashboard}
                    variant="default"
                    className="text-sm"
                  >
                    <BadgeDollarSign className="h-4 w-4 mr-2" /> Gérer Mes
                    Paiements
                  </Button>
                  {/* {user?.stripeAccountLink && !user?.hasStripeConnectAccount && (
                    <>
                      <Button asChild variant="default" className="text-sm">
                        <Link href={`/admin/stripe/onboarding/refresh`}>
                          {" "}
                          Stripe
                        </Link>
                      </Button>
                      <Button
                        variant="default"
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                        onClick={() => {
                          // Créer un élément <a> temporaire pour éviter l'interception par Next.js
                          const link = document.createElement("a");
                          link.href = user.stripeAccountLink || "";
                          link.target = "_blank";
                          link.rel = "noopener noreferrer";
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <CreditCardIcon className="h-4 w-4 mr-2" />
                        Configurer mon compte Stripe
                      </Button>
                    </>
                  )} */}

                  {user?.hasStripeConnectAccount && (
                    <Button variant="outline">
                      <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                      Compte vérifié
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
          <CardHeader className="flex justify-between">
            {/* // Add image upload here */}
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                {/* <AvatarImage src={user?.company.logo || undefined} /> */}
                <AvatarFallback>
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl ">
                  <div className="flex items-center space-x-1">
                    <div>
                      {user?.firstName} {user?.lastName}{" "}
                    </div>
                    <div className="">
                      {user?.identityVerified && (
                        <VerifiedIcon className="text-orange-500 size-7" />
                      )}{" "}
                    </div>
                  </div>
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={user?.status ? "default" : "destructive"}>
                    {user?.status ? "Actif" : "Inactif"}
                  </Badge>
                  <Badge variant="outline">{user?.role}</Badge>
                  <Badge variant="secondary">ID: {user?.identifier}</Badge>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex items-center space-x-2 max-w-96"
            >
              <EditIcon className="h-4 w-4" />
              <span>Modifier</span>
            </Button>
            {/* <Button
              variant="secondary"
              onClick={() => {
                router.push("/admin/identity");
              }}
              className="flex items-center space-x-2 max-w-96"
            >
              <Folder className="h-4 w-4" />
              <span>Dossier de Verification</span>
            </Button> */}
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
                  value={user?.phone || ""}
                />
              </div>
            </div>

            {/* Liste des colis */}
            <div className="border-t pt-4">
              <Collapsible>
                <div className="flex items-center justify-between mb-0">
                  <h3 className="text-lg font-semibold">
                    Vos Colis ({user?.packages?.length || 0})
                  </h3>

                  <Button variant="outline" size="sm">
                    <span className="mr-1">+</span> Nouveau colis
                  </Button>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  {user?.packages && user?.packages.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">
                              Description
                            </TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="hidden md:table-cell">
                              Catégorie
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                              Poids/Taille
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                              Prix
                            </TableHead>
                            {/* <TableHead className="text-right">
                              Actions
                            </TableHead> */}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {user?.packages?.map((pkg: IPackage) => (
                            <TableRow key={pkg.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <div className="h-10 w-10 overflow-hidden rounded bg-gray-100 flex-shrink-0">
                                    {pkg.imageUrl && pkg.imageUrl.length > 0 ? (
                                      <Image
                                        width={40}
                                        height={40}
                                        src={pkg.imageUrl[0].url}
                                        alt={pkg.imageUrl[0].title}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full items-center justify-center text-gray-400 text-xs">
                                        No img
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-medium truncate max-w-[200px]">
                                      {pkg.description}
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                      {new Date(
                                        pkg.createdAt
                                      ).toLocaleDateString("fr-CA")}
                                    </div>
                                    {pkg.fragile && (
                                      <div className="text-red-500 text-xs flex items-center mt-1">
                                        <span className="mr-1">⚠️</span> Fragile
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell></TableCell>
                              <TableCell className="hidden md:table-cell">
                                <span className="capitalize">
                                  {pkg.category?.toLowerCase() ||
                                    "Non catégorisé"}
                                </span>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="flex flex-col">
                                  <div className="flex items-center">
                                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-gray-400">
                                      ⚖️
                                    </span>
                                    <span>{pkg.weight} kg</span>
                                  </div>
                                  <div className="flex items-center mt-1">
                                    <span className="w-4 h-4 mr-1 flex items-center justify-center text-gray-400">
                                      📏
                                    </span>
                                    <span>{pkg.size || "Non spécifié"}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="flex items-center">
                                  <span className="w-4 h-4 mr-1 flex items-center justify-center text-gray-400">
                                    💰
                                  </span>
                                  <span>
                                    {Number(pkg.estimatedPrice).toFixed(2)}{" "}
                                    {user?.preferredCurrency || "CAD"}
                                  </span>
                                </div>
                              </TableCell>
                              {/* <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    router.push(
                                      `/admin/colis/${pkg.id}/detail`
                                    );
                                  }}
                                >
                                  Détails
                                </Button>
                              </TableCell> */}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dashed rounded-lg">
                      <p className="text-gray-500">Aucun colis trouvé.</p>
                      <Button variant="outline" className="mt-4">
                        Créer un nouveau colis
                      </Button>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Liste des livraisons */}
            <div className="border-t pt-4">
              <Collapsible>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold mb-2">
                    Vos Livraisons ({user?.sentDeliveries?.length || 0})
                  </h3>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </div>

                <CollapsibleContent>
                  {user?.sentDeliveries && user?.sentDeliveries.length > 0 ? (
                    <div className="border rounded-lg overflow-hidden mt-2">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Destination</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="hidden md:table-cell">
                              N° de suivi
                            </TableHead>
                            <TableHead className="hidden lg:table-cell">
                              Prix
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
                          {user?.sentDeliveries?.map((delivery: IDelivery) => (
                            <TableRow key={delivery.id}>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {delivery.deliveryCity}
                                  </span>
                                  <span className="text-xs text-gray-500 truncate max-w-[180px]">
                                    {delivery.deliveryAddressNumber}{" "}
                                    {delivery.deliveryAddress}
                                    {delivery.deliveryAddressComplement &&
                                      `, ${delivery.deliveryAddressComplement}`}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getDeliveryStatusBadge(delivery.status)}
                                {/* <DeliveryStatusBadge status={delivery.status} /> */}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="flex items-center">
                                  <span className="text-gray-500 mr-2">
                                    <QrCodeIcon className="h-4 w-4" />
                                  </span>
                                  <span className="text-sm font-mono">
                                    {delivery.trackingNumber}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {Number(delivery.estimatedPrice).toFixed(2)}{" "}
                                {user?.preferredCurrency}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <span className="text-sm text-gray-600">
                                  {new Date(
                                    delivery.createdAt
                                  ).toLocaleDateString("fr-CA")}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    router.push(
                                      `/admin/deliveries/${delivery.id}/detail`
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
                      <p className="text-gray-500">Aucune livraison trouvée.</p>
                      <Button variant="outline" className="mt-4">
                        Créer une nouvelle livraison
                      </Button>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
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
                                  {new Date(
                                    booking.appointmentStartDateTime
                                  ).toLocaleDateString("fr-CA")}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(
                                    booking.appointmentStartDateTime
                                  ).toLocaleTimeString("fr-CA", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </TableCell>
                              <TableCell>
                                <BookingStatusBadge status={booking.status} />
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {booking.payment?.total
                                  ? `${(booking.payment.total / 100).toFixed(2)} ${
                                      user?.preferredCurrency || "CAD"
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
                                        ? `${(payment.total / 100).toFixed(2)} ${
                                            user?.preferredCurrency || "CAD"
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
                                    {getPaymentStatusBadge(
                                      payment.paymentStatus || "PENDING"
                                    )}
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
                                        ? new Date(
                                            payment.paidAt
                                          ).toLocaleDateString("fr-CA")
                                        : new Date(
                                            payment.createdAt
                                          ).toLocaleDateString("fr-CA")}
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

            {/* Ajout des informations du compte */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Informations du compte</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow
                  icon={() => <span className="text-gray-500">🗓️</span>}
                  label="Date de création"
                  value={new Date(user?.createdAt).toLocaleDateString("fr-CA")}
                />
                <InfoRow
                  icon={() => <span className="text-gray-500">🔄</span>}
                  label="Dernière mise à jour"
                  value={new Date(user?.updatedAt).toLocaleDateString("fr-CA")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Modifier mon profil</DialogTitle>
            </DialogHeader>

            {/* Image de profil en haut */}
            {/* <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  {user?.profilePicture ? (
                    <AvatarImage
                      src={user.profilePicture}
                      alt="Photo de profil"
                    />
                  ) : (
                    <AvatarFallback className="text-xl">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                  onClick={() => {
                    // Ouvrir sélecteur de fichier
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        await handleLogoUpload(file);
                      }
                    };
                    input.click();
                  }}
                >
                  <EditIcon className="h-4 w-4" />
                </Button>
              </div>
            </div> */}

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

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input type="tel" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Préférences */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Préférences
                  </h3>

                  <FormField
                    control={form.control}
                    name="preferredCurrency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Devise préférée</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="CAD">Dollar canadien (CAD)</option>
                            <option value="USD">Dollar américain (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                            <option value="GBP">Livre sterling (GBP)</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Adresse */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Adresse</h3>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code postal</FormLabel>
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
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pays</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="Canada">Canada</option>
                            <option value="États-Unis">États-Unis</option>
                            <option value="France">France</option>
                            <option value="Belgique">Belgique</option>
                            <option value="Suisse">Suisse</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Informations supplémentaires */}
                {(session.user?.role === "ADMIN" ||
                  session.user?.role === "OWNER") && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-500">
                      Informations supplémentaires
                    </h3>

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entreprise</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Informations du système (afficher seulement, non modifiables) */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">
                    Informations du système
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Identifiant</p>
                      <p className="text-gray-600">{user?.identifier}</p>
                    </div>
                    <div>
                      <p className="font-medium">Statut de vérification</p>
                      <p className="text-gray-600">
                        {user?.verificationStatus}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Date d&apos;inscription</p>
                      <p className="text-gray-600">
                        {new Date(user?.createdAt).toLocaleDateString("fr-CA")}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Rôle</p>
                      <p className="text-gray-600">{user?.role}</p>
                    </div>
                  </div>
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
