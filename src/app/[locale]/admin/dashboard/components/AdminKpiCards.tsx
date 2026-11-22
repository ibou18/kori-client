/* eslint-disable @typescript-eslint/no-explicit-any */
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Calendar, DollarSign, Store, Users } from "lucide-react";
import Link from "next/link";

interface Segment {
  label: string;
  value: number;
  /** Classe Tailwind de fond (barre + pastille de légende). */
  color: string;
}

interface Row {
  label: string;
  value: string | number;
  hint?: string;
  /** Classe Tailwind de couleur du chiffre ; neutre par défaut. */
  tone?: string;
}

interface KpiCardProps {
  title: string;
  icon: LucideIcon;
  href: string;
  total: string | number;
  caption: string;
  segments?: Segment[];
  rows: Row[];
}

const GREEN = "bg-[#53745D]";
const GREEN_SOFT = "bg-[#A3BDA8]";
const AMBER = "bg-amber-400";
const RED = "bg-red-400";
const NEUTRAL = "bg-slate-300";

/** Barre de répartition + légende chiffrée. */
function SegmentBar({ segments }: { segments: Segment[] }) {
  const sum = segments.reduce((acc, s) => acc + s.value, 0);
  return (
    <div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-slate-100">
        {sum > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((s) => (
              <div
                key={s.label}
                className={s.color}
                style={{ width: `${(s.value / sum) * 100}%` }}
                title={`${s.label} : ${s.value}`}
              />
            ))}
      </div>
      <ul className="mt-3 space-y-1.5">
        {segments.map((s) => (
          <li
            key={s.label}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2 text-slate-600">
              <span className={`h-2 w-2 shrink-0 rounded-full ${s.color}`} />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="font-semibold tabular-nums text-slate-900">
              {s.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function KpiCard({
  title,
  icon: Icon,
  href,
  total,
  caption,
  segments,
  rows,
}: KpiCardProps) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F0F4F1] text-[#53745D]">
            <Icon className="h-4 w-4" />
          </span>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#53745D] hover:underline"
        >
          Détails <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight tabular-nums text-slate-900">
        {total}
      </p>
      <p className="text-xs text-slate-500">{caption}</p>

      {segments && (
        <div className="mt-4">
          <SegmentBar segments={segments} />
        </div>
      )}

      <dl className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-2 text-sm"
          >
            <dt className="truncate text-slate-600">{row.label}</dt>
            <dd
              className={`whitespace-nowrap font-semibold tabular-nums ${
                row.tone ?? "text-slate-900"
              }`}
            >
              {row.value}
              {row.hint && (
                <span className="ml-1 text-xs font-normal text-slate-400">
                  {row.hint}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mt-4 h-9 w-28" />
      <Skeleton className="mt-5 h-2 w-full rounded-full" />
      <div className="mt-4 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(
    amount,
  );

/**
 * Indicateurs plateforme : une carte par domaine (total + répartition + détail),
 * au lieu d'une rangée de totaux doublée par une rangée de détails.
 */
export function AdminKpiCards({
  data,
  isLoading,
}: {
  data: any;
  isLoading: boolean;
}) {
  const grid = "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4";

  if (isLoading) {
    return (
      <div className={grid}>
        {[1, 2, 3, 4].map((i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (!data) return null;

  const { users = {}, salons = {}, bookings = {}, revenue = {} } = data;

  return (
    <div className={grid}>
      <KpiCard
        title="Utilisateurs"
        icon={Users}
        href="/admin/users"
        total={users.total || 0}
        caption="comptes au total"
        segments={[
          { label: "Clients", value: users.clients || 0, color: GREEN },
          { label: "Propriétaires", value: users.owners || 0, color: GREEN_SOFT },
          { label: "Employés", value: users.employees || 0, color: NEUTRAL },
        ]}
        rows={[
          { label: "Actifs", value: users.active || 0, tone: "text-[#53745D]" },
          { label: "Inactifs", value: users.inactive || 0, tone: "text-red-600" },
        ]}
      />

      <KpiCard
        title="Salons"
        icon={Store}
        href="/admin/salons"
        total={salons.total || 0}
        caption="salons inscrits"
        segments={[
          { label: "Actifs", value: salons.active || 0, color: GREEN },
          { label: "Inactifs", value: salons.inactive || 0, color: RED },
        ]}
        rows={[
          {
            // Actif + au moins une photo + au moins un service
            label: "Visibles dans l'app",
            value: salons.visibleInApp || 0,
            hint: `(${salons.visibleInAppRate ?? 0} %)`,
            tone: "text-[#53745D]",
          },
          { label: "Non visibles", value: salons.notVisibleInApp || 0 },
          { label: "Vérifiés", value: salons.verified || 0 },
          {
            label: "Non vérifiés",
            value: salons.unverified || 0,
            tone: "text-amber-600",
          },
        ]}
      />

      <KpiCard
        title="Réservations"
        icon={Calendar}
        href="/admin/bookings"
        total={bookings.total || 0}
        caption="réservations au total"
        segments={[
          { label: "Terminées", value: bookings.completed || 0, color: GREEN },
          { label: "En attente", value: bookings.pending || 0, color: AMBER },
          { label: "Annulées", value: bookings.cancelled || 0, color: RED },
        ]}
        rows={[
          { label: "Aujourd'hui", value: bookings.today || 0 },
          { label: "Cette semaine", value: bookings.thisWeek || 0 },
          { label: "Ce mois", value: bookings.thisMonth || 0 },
        ]}
      />

      <KpiCard
        title="Revenus"
        icon={DollarSign}
        href="/admin/payments"
        total={formatCurrency(revenue.total || 0)}
        caption="revenus totaux"
        rows={[
          { label: "Aujourd'hui", value: formatCurrency(revenue.today || 0) },
          {
            label: "Cette semaine",
            value: formatCurrency(revenue.thisWeek || 0),
          },
          {
            label: "Payés ce mois",
            value: formatCurrency(revenue.thisMonth || 0),
            tone: "text-[#53745D]",
          },
        ]}
      />
    </div>
  );
}
