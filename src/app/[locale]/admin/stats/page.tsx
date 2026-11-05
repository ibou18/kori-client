/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import {
  useGetAdminStats,
  useGetRevenueEvolution,
  useGetTopSalons,
  useGetTopServices,
} from "@/app/data/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Calendar,
  CalendarRange,
  DollarSign,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminKpiCards } from "../dashboard/components/AdminKpiCards";

type DateRange = "7days" | "month" | "3months" | "6months" | "year" | "custom";

const RANGES: { value: DateRange; label: string }[] = [
  { value: "7days", label: "7 jours" },
  { value: "month", label: "Mois en cours" },
  { value: "3months", label: "3 mois" },
  { value: "6months", label: "6 mois" },
  { value: "year", label: "Année en cours" },
  { value: "custom", label: "Personnalisée" },
];

const BRAND = "#53745D";
const CARD = "rounded-xl border border-slate-200 bg-white shadow-sm";

const formatCurrency = (amount: number) =>
  (amount || 0).toLocaleString("fr-CA", { style: "currency", currency: "CAD" });

const formatCompact = (value: number) =>
  new Intl.NumberFormat("fr-CA", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

/** L'API renvoie des jours (YYYY-MM-DD) ou des mois (YYYY-MM) selon la longueur de la période. */
const formatEvolutionDateLabel = (value: string) => {
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split("-");
    return new Intl.DateTimeFormat("fr-CA", {
      month: "short",
      year: "2-digit",
    }).format(new Date(Number(year), Number(month) - 1, 1));
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return dayjs(value).format("DD MMM");
  }
  return value;
};

function resolveDateParams(range: DateRange, start: string, end: string) {
  const today = dayjs();
  const from: Record<Exclude<DateRange, "custom">, dayjs.Dayjs> = {
    "7days": today.subtract(7, "days"),
    month: today.startOf("month"),
    "3months": today.subtract(3, "months"),
    "6months": today.subtract(6, "months"),
    year: today.startOf("year"),
  };
  if (range === "custom") {
    if (!start || !end) return null;
    return {
      startDate: dayjs(start).format("YYYY-MM-DD"),
      endDate: dayjs(end).format("YYYY-MM-DD"),
    };
  }
  return {
    startDate: from[range].format("YYYY-MM-DD"),
    endDate: today.format("YYYY-MM-DD"),
  };
}

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-3 flex flex-wrap items-baseline gap-x-3">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function PeriodKpi({
  label,
  value,
  hint,
  icon: Icon,
  highlighted = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-5 shadow-sm",
        highlighted
          ? "border-transparent bg-gradient-to-br from-[#53745D] to-[#34503F] text-white"
          : "border-slate-200 bg-white",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-wide",
            highlighted ? "text-white/75" : "text-slate-500",
          )}
        >
          {label}
        </p>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            highlighted ? "bg-white/15" : "bg-[#F0F4F1] text-[#53745D]",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">
        {value}
      </p>
      {hint && (
        <p
          className={cn(
            "mt-1 text-xs",
            highlighted ? "text-white/70" : "text-slate-500",
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

function EvolutionChart({
  title,
  icon: Icon,
  data,
  dataKey,
  seriesLabel,
  format,
  isLoading,
}: {
  title: string;
  icon: LucideIcon;
  data: any[];
  dataKey: string;
  seriesLabel: string;
  format: (value: number) => string;
  isLoading: boolean;
}) {
  const values = data.map((item) => Number(item[dataKey]) || 0);
  const total = values.reduce((sum, v) => sum + v, 0);
  const average = values.length ? total / values.length : 0;
  const peak = values.length ? Math.max(...values) : 0;
  const gradientId = `gradient-${dataKey}`;

  return (
    <div className={cn(CARD, "p-5")}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0F4F1] text-[#53745D]">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="mt-4 h-64">
        {isLoading ? (
          <Skeleton className="h-full w-full" />
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Aucune donnée sur la période sélectionnée
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BRAND} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F1F5F9"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatEvolutionDateLabel}
                tick={{ fontSize: 11, fill: "#64748B" }}
                tickLine={false}
                axisLine={false}
                minTickGap={24}
              />
              <YAxis
                allowDecimals={false}
                tickFormatter={formatCompact}
                tick={{ fontSize: 11, fill: "#64748B" }}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                formatter={(value: number) => [format(value), seriesLabel]}
                labelFormatter={(value) =>
                  formatEvolutionDateLabel(String(value))
                }
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={BRAND}
                strokeWidth={2.5}
                fill={`url(#${gradientId})`}
                dot={data.length <= 31 ? { r: 3, fill: BRAND } : false}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
        {[
          { label: "Total", value: format(total), strong: true },
          { label: "Moyenne / intervalle", value: format(average) },
          { label: "Pic", value: format(peak) },
        ].map((item) => (
          <div key={item.label}>
            <dt className="text-xs text-slate-500">{item.label}</dt>
            <dd
              className={cn(
                "text-base font-semibold tabular-nums",
                item.strong ? "text-[#53745D]" : "text-slate-900",
              )}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

interface RankItem {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
  href?: string;
}

/** Classement avec barre proportionnelle à la mesure choisie. */
function RankList({
  title,
  hint,
  icon: Icon,
  items,
  metric,
  emptyLabel,
}: {
  title: string;
  hint: string;
  icon: LucideIcon;
  items: RankItem[];
  metric: "bookings" | "revenue";
  emptyLabel: string;
}) {
  const max = Math.max(...items.map((item) => item[metric] || 0), 0);

  return (
    <div className={cn(CARD, "p-5")}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F0F4F1] text-[#53745D]">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{hint}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">{emptyLabel}</p>
      ) : (
        <ol className="mt-4 space-y-1">
          {items.map((item, index) => {
            const row = (
              <>
                <div className="flex items-center gap-3 text-sm">
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      index < 3
                        ? "bg-[#53745D] text-white"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-900">
                    {item.name}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {item.bookings} rés.
                  </span>
                  <span className="w-24 shrink-0 text-right font-semibold tabular-nums text-[#53745D]">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
                <div className="ml-9 mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#A3BDA8]"
                    style={{
                      width: `${max > 0 ? ((item[metric] || 0) / max) * 100 : 0}%`,
                    }}
                  />
                </div>
              </>
            );
            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="block rounded-lg px-2 py-2 transition-colors hover:bg-slate-50"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="px-2 py-2">{row}</div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export default function StatsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("7days");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const dateParams = resolveDateParams(
    dateRange,
    customStartDate,
    customEndDate,
  );

  const { data: statsData, isLoading } = useGetAdminStats(
    dateParams || undefined,
  );
  const { data: topServicesData } = useGetTopServices(
    dateParams ? { ...dateParams, limit: 10 } : undefined,
  );
  const { data: topSalonsData } = useGetTopSalons(
    dateParams ? { ...dateParams, limit: 10 } : undefined,
  );
  const { data: evolutionData, isLoading: evolutionLoading } =
    useGetRevenueEvolution(dateParams || undefined);

  const asArray = (res: any): any[] => {
    const value = res?.data ?? res;
    return Array.isArray(value) ? value : [];
  };

  const stats = statsData?.data || statsData;
  const evolution = asArray(evolutionData);
  const topServices: RankItem[] = asArray(topServicesData).map((s) => ({
    id: s.serviceId,
    name: s.serviceName,
    bookings: s.bookings || 0,
    revenue: s.revenue || 0,
  }));
  const topSalons: RankItem[] = asArray(topSalonsData).map((s) => ({
    id: s.salonId,
    name: s.salonName,
    bookings: s.bookings || 0,
    revenue: s.revenue || 0,
    href: `/admin/salons/${s.salonId}`,
  }));

  const platformFees = evolution.reduce(
    (sum, item) => sum + (item.platformFees || 0),
    0,
  );
  const revenueInPeriod = stats?.revenue?.inPeriod || 0;
  const periodLabel = dateParams
    ? `${dayjs(dateParams.startDate).format("D MMM YYYY")} – ${dayjs(
        dateParams.endDate,
      ).format("D MMM YYYY")}`
    : "Choisissez une date de début et de fin";

  const dateInputClass =
    "h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#53745D] focus:ring-2 focus:ring-[#53745D]/20";

  return (
    <PageWrapper
      title="Statistiques"
      description="Analyse de la performance de la plateforme"
    >
      <div className="space-y-8">
        {/* Période d'analyse */}
        <div
          className={cn(
            CARD,
            "flex flex-col gap-3 p-3 lg:flex-row lg:items-center lg:justify-between",
          )}
        >
          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Période d'analyse"
              className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1"
            >
              {RANGES.map((range) => (
                <button
                  key={range.value}
                  type="button"
                  onClick={() => setDateRange(range.value)}
                  aria-pressed={dateRange === range.value}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    dateRange === range.value
                      ? "bg-white text-[#3a5a47] shadow-sm"
                      : "text-slate-500 hover:text-slate-800",
                  )}
                >
                  {range.label}
                </button>
              ))}
            </div>
            {dateRange === "custom" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  aria-label="Date de début"
                  value={customStartDate}
                  max={customEndDate || undefined}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className={dateInputClass}
                />
                <span className="text-slate-400">–</span>
                <input
                  type="date"
                  aria-label="Date de fin"
                  value={customEndDate}
                  min={customStartDate || undefined}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className={dateInputClass}
                />
              </div>
            )}
          </div>
          <p className="flex items-center gap-2 px-2 text-sm text-slate-600">
            <CalendarRange className="h-4 w-4 text-[#53745D]" />
            {periodLabel}
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        ) : !stats ? (
          <div className={cn(CARD, "p-10 text-center text-sm text-slate-500")}>
            Aucune statistique disponible
          </div>
        ) : (
          <>
            {/* Chiffres de la période */}
            <section>
              <SectionTitle title="Sur la période" hint={periodLabel} />
              <div className="grid gap-4 sm:grid-cols-3">
                <PeriodKpi
                  label="Revenus"
                  value={formatCurrency(revenueInPeriod)}
                  hint={`${formatCurrency(stats.revenue?.total || 0)} depuis le lancement`}
                  icon={DollarSign}
                  highlighted
                />
                <PeriodKpi
                  label="Frais Korí"
                  value={formatCurrency(platformFees)}
                  hint="Commissions sur réservations payées"
                  icon={DollarSign}
                />
                <PeriodKpi
                  label="Réservations créées"
                  value={stats.bookings?.inPeriod || 0}
                  hint={`${stats.bookings?.total || 0} depuis le lancement`}
                  icon={Calendar}
                />
              </div>
            </section>

            {/* Évolution */}
            <section>
              <SectionTitle title="Évolution" hint={periodLabel} />
              <div className="grid gap-4 lg:grid-cols-2">
                <EvolutionChart
                  title="Réservations"
                  icon={Calendar}
                  data={evolution}
                  dataKey="bookings"
                  seriesLabel="Réservations"
                  format={(v) => Math.round(v).toLocaleString("fr-CA")}
                  isLoading={evolutionLoading}
                />
                <EvolutionChart
                  title="Frais de réservation Korí"
                  icon={DollarSign}
                  data={evolution}
                  dataKey="platformFees"
                  seriesLabel="Frais Korí"
                  format={formatCurrency}
                  isLoading={evolutionLoading}
                />
              </div>
            </section>

            {/* Classements */}
            <section>
              <SectionTitle title="Classements" hint={periodLabel} />
              <div className="grid gap-4 lg:grid-cols-2">
                <RankList
                  title="Services les plus commandés"
                  hint="Classés par nombre de réservations"
                  icon={Star}
                  items={topServices}
                  metric="bookings"
                  emptyLabel="Aucun service réservé sur la période"
                />
                <RankList
                  title="Top salons"
                  hint="Classés par revenus"
                  icon={Building2}
                  items={topSalons}
                  metric="revenue"
                  emptyLabel="Aucun salon avec revenus sur la période"
                />
              </div>
            </section>

            {/* État global, indépendant de la période choisie */}
            <section>
              <SectionTitle
                title="État de la plateforme"
                hint="Depuis le lancement — indépendant de la période"
              />
              <AdminKpiCards data={stats} isLoading={false} />
            </section>
          </>
        )}
      </div>
    </PageWrapper>
  );
}
