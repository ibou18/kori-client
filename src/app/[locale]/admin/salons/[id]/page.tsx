/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { CrmNotesPanel } from "@/app/components/crm/CrmNotesPanel";
import { useGetSalon } from "@/app/data/hooks";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ADMIN } from "@/shared/constantes";
import { SalonStatusBadge } from "@/utils/statusUtils";
import dayjs from "dayjs";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  Edit,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Scissors,
  Shield,
  Star,
  User,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

interface Address {
  id: string;
  street?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  country?: string;
}

interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
}

interface SalonPhoto {
  id: string;
  url: string;
  alt?: string;
  order: number;
  isMain?: boolean;
}

interface SalonHoliday {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

interface SalonService {
  id: string;
  name: string;
  description?: string;
  duration: number;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  };
}

interface Salon {
  id: string;
  name: string;
  description?: string;
  phone: string;
  email: string;
  website?: string;
  rating: number;
  reviewCount: number;
  timezone: string;
  salonTypes?: string[];
  openingHours?: any;
  isActive: boolean;
  isVerified: boolean;
  offersHomeService: boolean;
  stripeAccountId?: string | null;
  stripeConnectEnabled?: boolean;
  commissionRate?: number;
  depositEnabled?: boolean;
  depositPercentage?: number | null;
  stripeChargesEnabled?: boolean;
  dashboardUrl?: string | null;
  providerCancellationCount?: number;
  lastProviderCancellation?: string | null;
  visibilityReduced?: boolean;
  accountSuspended?: boolean;
  suspensionReason?: string | null;
  suspensionEndDate?: string | null;
  createdAt: string;
  updatedAt: string;
  address?: Address;
  owner?: Owner;
  employees?: Employee[];
  photos?: SalonPhoto[];
  holidays?: SalonHoliday[];
  services?: SalonService[];
}

/** Carte de section : icône, titre, compteur optionnel. */
function Section({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string;
  icon: LucideIcon;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0F4F1] text-[#53745D]">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {count !== undefined && (
          <span className="rounded-full bg-[#F0F4F1] px-2 py-0.5 text-xs font-semibold text-[#53745D]">
            {count}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="break-words text-sm font-medium text-slate-900">
          {children}
        </dd>
      </div>
    </div>
  );
}

export default function SalonDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;
  const salonId = params?.id as string;

  const { data: salonData, isLoading, error } = useGetSalon(salonId);

  // Normaliser les données
  const salon: Salon | null = salonData?.data || salonData || null;

  if (!session) {
    return (
      <PageWrapper title="Détails du salon">
        <p className="text-center mt-10">
          Connexion requise pour accéder à cette page!
        </p>
      </PageWrapper>
    );
  }

  if (isLoading) {
    return (
      <PageWrapper title="Détails du salon">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !salon) {
    return (
      <PageWrapper title="Détails du salon">
        <div className="text-center mt-10">
          <p className="text-red-600 mb-4">
            {error ? "Erreur lors du chargement du salon" : "Salon non trouvé"}
          </p>
          <Button
            onClick={() => router.push("/admin/salons")}
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la liste
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const mainPhoto = salon.photos?.find((p) => p.isMain) || salon.photos?.[0];
  const isAdmin = (session.user as any)?.role === ADMIN;

  const DAYS: [key: string, label: string][] = [
    ["monday", "Lundi"],
    ["tuesday", "Mardi"],
    ["wednesday", "Mercredi"],
    ["thursday", "Jeudi"],
    ["friday", "Vendredi"],
    ["saturday", "Samedi"],
    ["sunday", "Dimanche"],
  ];
  // dayjs : 0 = dimanche ; DAYS commence au lundi
  const todayIndex = (dayjs().day() + 6) % 7;
  const openingHoursList = salon.openingHours
    ? DAYS.map(([key, label], index) => {
        const dayHours = salon.openingHours[key];
        return {
          day: label,
          hours: dayHours ? `${dayHours.open} – ${dayHours.close}` : null,
          isToday: index === todayIndex,
        };
      })
    : null;

  const publicSalonHref = `/${locale}/salon/${salon.id}`;
  const addressLine = salon.address
    ? [
        salon.address.street,
        [salon.address.city, salon.address.postalCode].filter(Boolean).join(" "),
        salon.address.province,
        salon.address.country,
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  const services = salon.services ?? [];
  const employees = salon.employees ?? [];
  const photos = salon.photos ?? [];
  const holidays = salon.holidays ?? [];

  const kpis: { label: string; value: string | number; icon: LucideIcon }[] = [
    { label: "Note moyenne", value: salon.rating?.toFixed(1) || "0.0", icon: Star },
    { label: "Avis", value: salon.reviewCount || 0, icon: MessageSquare },
    { label: "Services", value: services.length, icon: Scissors },
    { label: "Employés", value: employees.length, icon: Users },
    { label: "Photos", value: photos.length, icon: ImageIcon },
  ];

  return (
    <PageWrapper title={salon.name}>
      {/* Bandeau d'identité */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-32 bg-gradient-to-br from-[#53745D] to-[#34503F] sm:h-40">
          {mainPhoto && (
            <>
              <Image
                src={mainPhoto.url}
                alt=""
                fill
                sizes="100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-black/10" />
            </>
          )}
        </div>

        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:gap-5">
          <div className="relative -mt-14 h-24 w-24 shrink-0 overflow-hidden rounded-xl border-4 border-white bg-[#F0F4F1] shadow-sm">
            {mainPhoto ? (
              <Image
                src={mainPhoto.url}
                alt={mainPhoto.alt || salon.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[#53745D]">
                <Building2 className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-bold tracking-tight text-slate-900">
              {salon.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <SalonStatusBadge
                isActive={salon.isActive}
                isVerified={salon.isVerified}
              />
              {salon.offersHomeService && (
                <Badge
                  variant="outline"
                  className="border-green-200 bg-green-50 text-green-700"
                >
                  Service à domicile
                </Badge>
              )}
              {salon.accountSuspended && (
                <Badge
                  variant="outline"
                  className="border-red-200 bg-red-50 text-red-700"
                >
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Suspendu
                </Badge>
              )}
              {salon.visibilityReduced && (
                <Badge
                  variant="outline"
                  className="border-yellow-200 bg-yellow-50 text-yellow-700"
                >
                  Visibilité réduite
                </Badge>
              )}
              {salon.salonTypes?.map((type) => (
                <Badge key={type} variant="outline" className="text-slate-600">
                  {type}
                </Badge>
              ))}
            </div>
            {addressLine && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{addressLine}</span>
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/salons")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(publicSalonHref)}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Page publique
            </Button>
            <Button
              size="sm"
              onClick={() => router.push(`/admin/salons/${salon.id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Button>
          </div>
        </div>

        {salon.description && (
          <p className="border-t border-slate-100 px-5 py-4 text-sm leading-relaxed text-slate-600">
            {salon.description}
          </p>
        )}

        {/* Chiffres clés */}
        <dl className="grid grid-cols-2 divide-slate-100 border-t border-slate-100 sm:grid-cols-5 sm:divide-x">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="flex items-center gap-3 px-5 py-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F0F4F1] text-[#53745D]">
                <kpi.icon className="h-4 w-4" />
              </span>
              <div>
                <dd className="text-lg font-bold tabular-nums text-slate-900">
                  {kpi.value}
                </dd>
                <dt className="text-xs text-slate-500">{kpi.label}</dt>
              </div>
            </div>
          ))}
        </dl>
      </section>

      {salon.accountSuspended && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <span className="font-semibold">Compte suspendu.</span>{" "}
            {salon.suspensionReason}
            {salon.suspensionEndDate &&
              ` Jusqu'au ${dayjs(salon.suspensionEndDate).format("DD MMM YYYY")}.`}
          </p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 md:grid-cols-2">
            <Section title="Coordonnées" icon={Phone}>
              <dl className="space-y-3">
                <InfoRow icon={Mail} label="Email">
                  <a href={`mailto:${salon.email}`} className="hover:underline">
                    {salon.email}
                  </a>
                </InfoRow>
                <InfoRow icon={Phone} label="Téléphone">
                  <a href={`tel:${salon.phone}`} className="hover:underline">
                    {salon.phone}
                  </a>
                </InfoRow>
                {salon.website && (
                  <InfoRow icon={Globe} label="Site web">
                    <a
                      href={salon.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#53745D] hover:underline"
                    >
                      <span className="truncate">{salon.website}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </InfoRow>
                )}
                {addressLine && (
                  <InfoRow icon={MapPin} label="Adresse">
                    {addressLine}
                  </InfoRow>
                )}
                <InfoRow icon={Clock} label="Fuseau horaire">
                  {salon.timezone}
                </InfoRow>
              </dl>
            </Section>

            {openingHoursList && (
              <Section title="Horaires d'ouverture" icon={Clock}>
                <ul className="space-y-0.5 text-sm">
                  {openingHoursList.map((item) => (
                    <li
                      key={item.day}
                      className={cn(
                        "flex items-center justify-between rounded-md px-2 py-1.5",
                        item.isToday && "bg-[#F0F4F1] font-semibold text-[#3a5a47]",
                      )}
                    >
                      <span>{item.day}</span>
                      <span
                        className={cn(
                          "tabular-nums",
                          !item.hours && "text-slate-400",
                        )}
                      >
                        {item.hours ?? "Fermé"}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
          </div>

          {photos.length > 0 && (
            <Section title="Photos" icon={ImageIcon} count={photos.length}>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square overflow-hidden rounded-lg bg-slate-100"
                  >
                    <Image
                      src={photo.url}
                      alt={photo.alt || salon.name}
                      fill
                      sizes="(min-width: 768px) 160px, 33vw"
                      className="object-cover"
                    />
                    {photo.isMain && (
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-[#53745D] px-2 py-0.5 text-[10px] font-semibold text-white">
                        Principale
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {services.length > 0 && (
            <Section title="Services" icon={Scissors} count={services.length}>
              <ul className="divide-y divide-slate-100">
                {services.slice(0, 10).map((service) => (
                  <li
                    key={service.id}
                    className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">
                          {service.name}
                        </p>
                        {service.category && (
                          <Badge variant="outline" className="text-xs">
                            {service.category.name}
                          </Badge>
                        )}
                        {!service.isActive && (
                          <Badge
                            variant="outline"
                            className="bg-slate-50 text-xs text-slate-500"
                          >
                            Inactif
                          </Badge>
                        )}
                      </div>
                      {service.description && (
                        <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      <Clock className="h-3 w-3" />
                      {service.duration} min
                    </span>
                  </li>
                ))}
              </ul>
              {services.length > 10 && (
                <p className="mt-3 text-center text-xs text-slate-500">
                  +{services.length - 10} autres services
                </p>
              )}
            </Section>
          )}

          {employees.length > 0 && (
            <Section title="Employés" icon={Users} count={employees.length}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {employees.map((employee) => (
                  <button
                    key={employee.id}
                    type="button"
                    onClick={() => router.push(`/admin/users/${employee.id}`)}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <Avatar>
                      <AvatarFallback className="bg-[#F0F4F1] text-[#3a5a47]">
                        {employee.firstName.charAt(0)}
                        {employee.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {employee.email}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                  </button>
                ))}
              </div>
            </Section>
          )}

          {holidays.length > 0 && (
            <Section title="Vacances" icon={Calendar} count={holidays.length}>
              <ul className="divide-y divide-slate-100">
                {holidays.map((holiday) => (
                  <li key={holiday.id} className="py-2.5 first:pt-0 last:pb-0">
                    <p className="text-sm font-medium text-slate-900">
                      {dayjs(holiday.startDate).format("DD MMM YYYY")} –{" "}
                      {dayjs(holiday.endDate).format("DD MMM YYYY")}
                    </p>
                    {holiday.reason && (
                      <p className="text-sm text-slate-500">{holiday.reason}</p>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Suivi CRM (admin / support) */}
          <CrmNotesPanel subject={{ salonId: salon.id }} subjectLabel="ce salon" />
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {salon.owner && (
            <Section title="Propriétaire" icon={User}>
              <div className="flex items-center gap-3">
                {salon.owner.avatar ? (
                  <Image
                    src={salon.owner.avatar}
                    alt={`${salon.owner.firstName} ${salon.owner.lastName}`}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-[#53745D] text-white">
                      {salon.owner.firstName.charAt(0)}
                      {salon.owner.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {salon.owner.firstName} {salon.owner.lastName}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {salon.owner.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full"
                onClick={() => router.push(`/admin/users/${salon.owner?.id}`)}
              >
                Voir le profil
              </Button>
            </Section>
          )}

          {(salon.stripeAccountId ||
            salon.stripeConnectEnabled !== undefined) && (
            <Section title="Paiements" icon={CreditCard}>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">Stripe Connect</dt>
                  <dd>
                    <Badge
                      variant="outline"
                      className={
                        salon.stripeConnectEnabled
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-yellow-200 bg-yellow-50 text-yellow-700"
                      }
                    >
                      {salon.stripeConnectEnabled ? "Activé" : "Non activé"}
                    </Badge>
                  </dd>
                </div>
                {salon.commissionRate !== undefined && (
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">Commission</dt>
                    <dd className="font-semibold tabular-nums text-slate-900">
                      {(salon.commissionRate * 100).toFixed(1)} %
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-slate-500">Acompte à la réservation</dt>
                  <dd className="text-right">
                    {salon.depositEnabled ? (
                      <>
                        <span className="font-semibold text-[#53745D]">
                          {salon.depositPercentage != null
                            ? `${Math.round(salon.depositPercentage * 100)} %`
                            : "Taux plateforme"}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {salon.depositPercentage != null
                            ? "choisi par le salon"
                            : "par défaut"}
                        </span>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-slate-600">
                        Désactivé
                      </Badge>
                    )}
                  </dd>
                </div>
                {salon.stripeAccountId && (
                  <div>
                    <dt className="text-slate-500">Account ID</dt>
                    <dd className="mt-0.5 break-all font-mono text-xs text-slate-700">
                      {salon.stripeAccountId}
                    </dd>
                  </div>
                )}
              </dl>
              {salon.dashboardUrl && (
                <a
                  href={salon.dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#53745D] hover:underline"
                >
                  Ouvrir le dashboard Stripe
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </Section>
          )}

          <Section title="Informations système" icon={Shield}>
            <dl className="space-y-3 text-sm">
              {salon.providerCancellationCount !== undefined &&
                salon.providerCancellationCount > 0 && (
                  <div className="flex items-start justify-between gap-2">
                    <dt className="text-slate-500">Annulations</dt>
                    <dd className="text-right font-semibold text-slate-900">
                      {salon.providerCancellationCount}
                      {salon.lastProviderCancellation && (
                        <span className="block text-xs font-normal text-slate-500">
                          dernière le{" "}
                          {dayjs(salon.lastProviderCancellation).format(
                            "DD MMM YYYY",
                          )}
                        </span>
                      )}
                    </dd>
                  </div>
                )}
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Créé le</dt>
                <dd className="font-medium text-slate-900">
                  {dayjs(salon.createdAt).format("DD MMM YYYY à HH:mm")}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-slate-500">Modifié le</dt>
                <dd className="font-medium text-slate-900">
                  {dayjs(salon.updatedAt).format("DD MMM YYYY à HH:mm")}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">ID salon</dt>
                <dd className="mt-0.5 break-all font-mono text-xs text-slate-700">
                  {salon.id}
                </dd>
              </div>
            </dl>
          </Section>
        </div>
      </div>
    </PageWrapper>
  );
}
