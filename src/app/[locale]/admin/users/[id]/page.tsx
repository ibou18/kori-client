"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { UserModal } from "@/app/components/UserModal";
import { useGetUser, useUpdateUser } from "@/app/data/hooks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingStatusBadge, UserStatusBadge } from "@/utils/statusUtils";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Bell,
  Calendar,
  CheckCircle,
  CreditCard,
  Edit,
  Globe,
  Heart,
  Languages,
  Mail,
  Phone,
  Settings,
  Shield,
  Star,
  User as UserIcon,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

interface Session {
  id: string;
  sessionToken: string;
  expires: string;
  isActive: boolean;
}

interface Preference {
  language: string;
  defaultCurrency: string;
  notificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  timezone: string;
}

interface Booking {
  id: string;
  appointmentStartDateTime: string;
  appointmentEndDateTime: string;
  duration: number;
  status: string;
  isHomeService: boolean;
  paymentStatus?: string | null;
  createdAt: string;
}

interface Account {
  id: string;
  type: string;
  provider: string;
  providerAccountId: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  indicatif?: string;
  role: "ADMIN" | "OWNER" | "CLIENT" | "EMPLOYEE" | "SYSTEM";
  avatar?: string | null;
  isActive: boolean;
  isEmailVerified?: boolean;
  lastLogin?: string | null;
  stripeCustomerId?: string | null;
  stripeAccountId?: string | null;
  stripeOnboardingCompleted?: boolean;
  createdAt: string;
  updatedAt?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  company?: string;
  timezone?: string;
  gender?: string | null;
  bio?: string | null;
  experience?: number | null;
  rating?: number;
  sessions?: Session[];
  preferences?: Preference;
  bookings?: Booking[];
  reviews?: any[];
  ratings?: any[];
  accounts?: Account[];
  favorites?: any[];
}

export default function UserDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: userData, isLoading, error } = useGetUser(userId);
  const { mutate: updateUser } = useUpdateUser();

  // Normaliser les données
  const user: User | null = userData?.data || userData || null;

  if (!session) {
    return (
      <PageWrapper title="Détails de l'utilisateur">
        <p className="text-center mt-10">
          Connexion requise pour accéder à cette page!
        </p>
      </PageWrapper>
    );
  }

  if (isLoading) {
    return (
      <PageWrapper title="Détails de l'utilisateur">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !user) {
    return (
      <PageWrapper title="Détails de l'utilisateur">
        <div className="text-center mt-10">
          <p className="text-red-600 mb-4">
            {error
              ? "Erreur lors du chargement de l'utilisateur"
              : "Utilisateur non trouvé"}
          </p>
          <Button onClick={() => router.push("/admin/users")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const roleColors: Record<string, string> = {
    CLIENT: "bg-blue-50 text-blue-700 border-blue-200",
    OWNER: "bg-purple-50 text-purple-700 border-purple-200",
    ADMIN: "bg-red-50 text-red-700 border-red-200",
    EMPLOYEE: "bg-green-50 text-green-700 border-green-200",
    SYSTEM: "bg-gray-50 text-gray-700 border-gray-200",
  };

  const roleLabels: Record<string, string> = {
    CLIENT: "Client",
    OWNER: "Propriétaire",
    ADMIN: "Administrateur",
    EMPLOYEE: "Employé",
    SYSTEM: "Système",
  };

  const handleModalSubmit = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    indicatif?: string;
    role: "ADMIN" | "OWNER" | "CLIENT" | "EMPLOYEE" | "SYSTEM";
    isActive: boolean;
    password?: string;
    id?: string;
  }) => {
    const updateData: any = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      role: values.role,
      isActive: values.isActive,
    };

    if (values.phone !== undefined) {
      updateData.phone = values.phone || null;
    }
    if (values.indicatif !== undefined) {
      updateData.indicatif = values.indicatif || null;
    }
    if (values.password) {
      updateData.password = values.password;
    }

    updateUser(
      {
        id: user.id,
        data: updateData,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      }
    );
  };

  return (
    <>
      <PageWrapper
        title={`${user.firstName} ${user.lastName}`}
        description={`Détails de l'utilisateur`}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/users")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  {user.avatar ? (
                    <Image
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      width={80}
                      height={80}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="bg-[#F0F4F1] text-[#53745D] text-2xl">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">
                      {user.firstName} {user.lastName}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <UserStatusBadge isActive={user.isActive} />
                      <Badge
                        variant="outline"
                        className={roleColors[user.role] || ""}
                      >
                        {roleLabels[user.role] || user.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                      {user.isEmailVerified === false && (
                        <div className="flex items-center gap-1 mt-1">
                          <XCircle className="h-3 w-3 text-yellow-600" />
                          <span className="text-xs text-yellow-600">
                            Email non vérifié
                          </span>
                        </div>
                      )}
                      {user.isEmailVerified === true && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <span className="text-xs text-green-600">
                            Email vérifié
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-medium">
                        {user.phone ? (
                          <>
                            {user.indicatif && user.indicatif !== "+1"
                              ? user.indicatif
                              : ""}
                            {user.phone}
                          </>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {user.address && (
                    <div className="flex items-start gap-3">
                      <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Adresse</p>
                        <p className="font-medium">
                          {user.address}
                          {user.city && `, ${user.city}`}
                          {user.postalCode && ` ${user.postalCode}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {user.company && (
                    <div className="flex items-start gap-3">
                      <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Entreprise</p>
                        <p className="font-medium">{user.company}</p>
                      </div>
                    </div>
                  )}

                  {user.timezone && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Fuseau horaire</p>
                        <p className="font-medium">{user.timezone}</p>
                      </div>
                    </div>
                  )}

                  {user.gender && (
                    <div className="flex items-start gap-3">
                      <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Genre</p>
                        <p className="font-medium">{user.gender}</p>
                      </div>
                    </div>
                  )}

                  {user.bio && (
                    <div className="flex items-start gap-3 col-span-1 md:col-span-2">
                      <UserIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">Biographie</p>
                        <p className="font-medium">{user.bio}</p>
                      </div>
                    </div>
                  )}

                  {user.experience !== null &&
                    user.experience !== undefined && (
                      <div className="flex items-start gap-3">
                        <Star className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Expérience</p>
                          <p className="font-medium">{user.experience} ans</p>
                        </div>
                      </div>
                    )}

                  {user.rating !== null &&
                    user.rating !== undefined &&
                    user.rating > 0 && (
                      <div className="flex items-start gap-3">
                        <Star className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Note moyenne</p>
                          <p className="font-medium flex items-center gap-1">
                            {user.rating.toFixed(1)}{" "}
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          </p>
                        </div>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>

            {/* Informations système */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Informations système
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">ID utilisateur</p>
                    <p className="font-mono text-sm font-medium break-all">
                      {user.id}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Rôle</p>
                    <Badge
                      variant="outline"
                      className={roleColors[user.role] || ""}
                    >
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <UserStatusBadge isActive={user.isActive} />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Dernière connexion</p>
                    <p className="font-medium">
                      {user.lastLogin ? (
                        <>
                          {dayjs(user.lastLogin).format("DD MMM YYYY")}
                          <span className="text-gray-500 ml-2">
                            {dayjs(user.lastLogin).format("HH:mm")}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-400">Jamais</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Date de création</p>
                    <p className="font-medium">
                      {dayjs(user.createdAt).format("DD MMM YYYY à HH:mm")}
                    </p>
                  </div>

                  {user.updatedAt && (
                    <div>
                      <p className="text-sm text-gray-500">
                        Dernière modification
                      </p>
                      <p className="font-medium">
                        {dayjs(user.updatedAt).format("DD MMM YYYY à HH:mm")}
                      </p>
                    </div>
                  )}

                  {user.stripeOnboardingCompleted !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">Onboarding Stripe</p>
                      <Badge
                        variant="outline"
                        className={
                          user.stripeOnboardingCompleted
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }
                      >
                        {user.stripeOnboardingCompleted
                          ? "Complété"
                          : "En attente"}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Préférences */}
            {user.preferences && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Préférences
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Langue</p>
                      <p className="font-medium flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        {user.preferences.language === "fr"
                          ? "Français"
                          : user.preferences.language === "en"
                          ? "English"
                          : user.preferences.language}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Devise par défaut</p>
                      <p className="font-medium">
                        {user.preferences.defaultCurrency}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Fuseau horaire</p>
                      <p className="font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        {user.preferences.timezone}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Notifications</p>
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Bell
                            className={`h-4 w-4 ${
                              user.preferences.notificationsEnabled
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={
                              user.preferences.notificationsEnabled
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            {user.preferences.notificationsEnabled
                              ? "Activées"
                              : "Désactivées"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail
                            className={`h-4 w-4 ${
                              user.preferences.emailNotificationsEnabled
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={
                              user.preferences.emailNotificationsEnabled
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            Email:{" "}
                            {user.preferences.emailNotificationsEnabled
                              ? "Oui"
                              : "Non"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone
                            className={`h-4 w-4 ${
                              user.preferences.smsNotificationsEnabled
                                ? "text-green-600"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={
                              user.preferences.smsNotificationsEnabled
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                          >
                            SMS:{" "}
                            {user.preferences.smsNotificationsEnabled
                              ? "Oui"
                              : "Non"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Réservations */}
            {user.bookings && user.bookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Réservations ({user.bookings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {user.bookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          router.push(`/admin/bookings/${booking.id}`)
                        }
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <BookingStatusBadge status={booking.status} />
                            {booking.isHomeService && (
                              <Badge variant="outline" className="text-xs">
                                Service à domicile
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-medium">
                            {dayjs(booking.appointmentStartDateTime).format(
                              "DD MMM YYYY à HH:mm"
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            Durée: {booking.duration} min
                          </p>
                        </div>
                        <ArrowLeft className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}
                    {user.bookings.length > 5 && (
                      <p className="text-xs text-gray-500 text-center">
                        +{user.bookings.length - 5} autres réservations
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comptes OAuth */}
            {user.accounts && user.accounts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Comptes connectés ({user.accounts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {user.accounts.map((account) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium capitalize">
                            {account.provider}
                          </p>
                          <p className="text-xs text-gray-500">
                            {account.type === "oauth" ? "OAuth" : account.type}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          Connecté
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Favoris */}
            {user.favorites && user.favorites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Favoris ({user.favorites.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {user.favorites.length} élément(s) en favoris
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Avis et notes */}
            {((user.reviews && user.reviews.length > 0) ||
              (user.ratings && user.ratings.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Avis et notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {user.reviews && user.reviews.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Avis</p>
                        <p className="text-2xl font-bold">
                          {user.reviews.length}
                        </p>
                      </div>
                    )}
                    {user.ratings && user.ratings.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Notes</p>
                        <p className="text-2xl font-bold">
                          {user.ratings.length}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Informations Stripe */}
            {(user.stripeCustomerId || user.stripeAccountId) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Stripe
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.stripeCustomerId && (
                    <div>
                      <p className="text-sm text-gray-500">Customer ID</p>
                      <p className="font-mono text-xs font-medium break-all">
                        {user.stripeCustomerId}
                      </p>
                    </div>
                  )}
                  {user.stripeAccountId && (
                    <div>
                      <p className="text-sm text-gray-500">Account ID</p>
                      <p className="font-mono text-xs font-medium break-all">
                        {user.stripeAccountId}
                      </p>
                    </div>
                  )}
                  {user.stripeOnboardingCompleted !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">Onboarding</p>
                      <Badge
                        variant="outline"
                        className={
                          user.stripeOnboardingCompleted
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }
                      >
                        {user.stripeOnboardingCompleted
                          ? "Complété"
                          : "En attente"}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Statistiques rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Réservations</span>
                  <span className="font-bold">
                    {user.bookings?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Sessions actives
                  </span>
                  <span className="font-bold">
                    {user.sessions?.filter((s) => s.isActive).length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Avis</span>
                  <span className="font-bold">{user.reviews?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Favoris</span>
                  <span className="font-bold">
                    {user.favorites?.length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" onClick={() => setIsModalOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier l'utilisateur
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/admin/users")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à la liste
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageWrapper>

      <UserModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
        }}
        user={user}
        onSubmit={handleModalSubmit}
      />
    </>
  );
}
