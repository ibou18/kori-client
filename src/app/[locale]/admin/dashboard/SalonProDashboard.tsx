"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import {
  useGetSalonBookings,
  useGetSalonDashboardStats,
  useGetSalonMonthlyRevenue,
  useGetSalonPopularServices,
} from "@/app/data/hooks";
import { BookingStatusBadge } from "@/utils/statusUtils";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Loader2,
  Scissors,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Calendar as BigCalendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

dayjs.extend(isoWeek);
dayjs.locale("fr");

const localizer = dayjsLocalizer(dayjs);

const MONTHS_FR = [
  "Jan","Fév","Mar","Avr","Mai","Jun",
  "Jul","Aoû","Sep","Oct","Nov","Déc",
];

const formatCad = (cents: number) =>
  new Intl.NumberFormat("fr-CA", { style: "currency", currency: "CAD" }).format(
    cents / 100,
  );

const BRAND = "#53745D";
const CHART_COLORS = ["#53745D", "#7A9B82", "#A3BDA8", "#C4D4C7", "#E0EAE2"];

const MESSAGES_FR = {
  allDay: "Journée",
  previous: "",
  next: "",
  today: "",
  month: "Mois",
  week: "Semaine",
  day: "Jour",
  agenda: "Agenda",
  date: "Date",
  time: "Heure",
  event: "Événement",
  noEventsInRange: "Aucun rendez-vous confirmé aujourd'hui",
  showMore: (total: number) => `+${total} de plus`,
};

interface KpiCardProps {
  label: string;
  appointments: number;
  revenue: number;
  icon: React.ReactNode;
}

function KpiCard({ label, appointments, revenue, icon }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <div className="rounded-full bg-[#F0F4F1] p-2 text-[#53745D]">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-slate-900">{appointments}</p>
          <p className="text-xs text-slate-500 mt-0.5">rendez-vous</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-[#53745D]">{formatCad(revenue)}</p>
          <p className="text-xs text-slate-500">revenus</p>
        </div>
      </div>
    </div>
  );
}

export function SalonProDashboard({ salonId }: { salonId: string }) {
  const currentYear = new Date().getFullYear();
  const today = dayjs().format("YYYY-MM-DD");

  const [bookingsOpen, setBookingsOpen] = useState(true);

  const { data: dashboardData, isLoading: dashLoading } =
    useGetSalonDashboardStats(salonId);
  const { data: monthlyData, isLoading: monthlyLoading } =
    useGetSalonMonthlyRevenue(salonId, { year: currentYear });
  const { data: popularData, isLoading: popularLoading } =
    useGetSalonPopularServices(salonId, 5);
  const { data: bookingsData, isLoading: bookingsLoading } =
    useGetSalonBookings(salonId, { limit: 8, offset: 0 });
  const { data: todayBookingsData, isLoading: todayLoading } =
    useGetSalonBookings(salonId, {
      startDate: today,
      endDate: dayjs().add(1, "day").format("YYYY-MM-DD"),
      status: "CONFIRMED",
      limit: 100,
    });

  const stats = (dashboardData as any)?.data;
  const monthlyRevenue: { month: number; revenue: number }[] =
    (monthlyData as any)?.data ?? [];
  const popularServices: { serviceName: string; bookings: number }[] =
    (popularData as any)?.data ?? [];
  const recentBookings: any[] = Array.isArray((bookingsData as any)?.data)
    ? (bookingsData as any).data
    : (bookingsData as any)?.data?.bookings ?? [];

  const todayBookings: any[] = Array.isArray((todayBookingsData as any)?.data)
    ? (todayBookingsData as any).data
    : (todayBookingsData as any)?.data?.bookings ?? [];

  const calendarEvents = todayBookings.map((b: any) => ({
    id: b.id,
    title: b.client
      ? `${b.client.firstName} ${b.client.lastName}`
      : "Client",
    start: new Date(b.appointmentStartDateTime),
    end: new Date(b.appointmentEndDateTime),
    resource: b,
  }));

  const chartData = monthlyRevenue.map((m) => ({
    month: MONTHS_FR[m.month - 1],
    revenus: Math.round(m.revenue / 100),
  }));

  if (dashLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-[#53745D]" />
      </div>
    );
  }

  if (!stats || typeof stats.code === "number") {
    return (
      <PageWrapper title="Tableau de bord salon">
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
          Impossible de charger les statistiques de votre salon.
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Tableau de bord">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Aujourd'hui"
          appointments={stats.today?.appointments ?? 0}
          revenue={stats.today?.revenue ?? 0}
          icon={<Calendar className="h-4 w-4" />}
        />
        <KpiCard
          label="Hier"
          appointments={stats.yesterday?.appointments ?? 0}
          revenue={stats.yesterday?.revenue ?? 0}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KpiCard
          label="7 derniers jours"
          appointments={stats.last7Days?.appointments ?? 0}
          revenue={stats.last7Days?.revenue ?? 0}
          icon={<Calendar className="h-4 w-4" />}
        />
        <KpiCard
          label="30 derniers jours"
          appointments={stats.last30Days?.appointments ?? 0}
          revenue={stats.last30Days?.revenue ?? 0}
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Monthly revenue chart */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Revenus mensuels</h3>
              <p className="text-xs text-slate-500">{currentYear}</p>
            </div>
            {monthlyLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v} $`} />
                <Tooltip
                  formatter={(v: number) => [`${v} $`, "Revenus"]}
                  labelFormatter={(l) => `Mois : ${l}`}
                />
                <Area
                  type="monotone"
                  dataKey="revenus"
                  stroke={BRAND}
                  strokeWidth={2.5}
                  fill="url(#colorRevenue)"
                  dot={{ r: 3, fill: BRAND }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
              Pas encore de données pour {currentYear}
            </div>
          )}
        </div>

        {/* Popular services */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Services populaires</h3>
              <p className="text-xs text-slate-500">Top 5 par réservations</p>
            </div>
            {popularLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          </div>
          {popularServices.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={popularServices}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="serviceName" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v: number) => [`${v}`, "Réservations"]} />
                <Bar dataKey="bookings" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {popularServices.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
              <div className="text-center">
                <Scissors className="mx-auto mb-2 h-8 w-8 opacity-30" />
                Aucun service réservé pour l&apos;instant
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calendrier du jour + Dernières réservations — côte à côte en grand écran */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2 xl:items-start">

      {/* Calendrier du jour */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="font-semibold text-slate-900">
              Planning du jour
            </h3>
            <p className="text-xs text-slate-500 capitalize mt-0.5">
              {dayjs().locale("fr").format("dddd D MMMM YYYY")} · {calendarEvents.length} RDV confirmé{calendarEvents.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/admin/calendrier"
            className="flex items-center gap-1 text-sm font-medium text-[#53745D] hover:underline"
          >
            Calendrier complet <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <style>{`
          .dashboard-cal .rbc-toolbar { display: none; }
          .dashboard-cal .rbc-header { display: none; }
          .dashboard-cal .rbc-time-header { display: none; }
          .dashboard-cal .rbc-today { background-color: #F0F4F1 !important; }
          .dashboard-cal .rbc-current-time-indicator { background-color: #53745D; height: 2px; }
          .dashboard-cal .rbc-event { background-color: #53745D; border-color: #53745D; border-radius: 6px; font-size: 12px; }
          .dashboard-cal .rbc-event:focus { outline: none; }
          .dashboard-cal .rbc-time-slot { font-size: 11px; color: #94A3B8; }
          .dashboard-cal .rbc-time-gutter .rbc-timeslot-group { border-color: #F1F5F9; }
          .dashboard-cal .rbc-time-content { border-color: #F1F5F9; }
        `}</style>

        {todayLoading ? (
          <div className="flex h-[380px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#53745D]" />
          </div>
        ) : (
          <div className="dashboard-cal">
            <BigCalendar
              localizer={localizer}
              events={calendarEvents}
              view="day"
              onView={() => {}}
              date={new Date()}
              onNavigate={() => {}}
              messages={MESSAGES_FR}
              culture="fr"
              style={{ height: 420 }}
              toolbar={false}
              tooltipAccessor={(event: any) => {
                const b = event.resource;
                return b?.bookedServices?.map((s: any) => s.serviceName).join(", ") ?? "";
              }}
            />
          </div>
        )}
      </div>

      {/* Dernières réservations — collapsable */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <button
          onClick={() => setBookingsOpen((o) => !o)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-slate-900">Dernières réservations</h3>
            {recentBookings.length > 0 && (
              <span className="rounded-full bg-[#F0F4F1] px-2 py-0.5 text-xs font-semibold text-[#53745D]">
                {recentBookings.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/bookings"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-sm font-medium text-[#53745D] hover:underline"
            >
              Voir tout <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            {bookingsOpen ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </div>
        </button>

        {bookingsOpen && (
          <>
            {bookingsLoading ? (
              <div className="flex justify-center border-t border-slate-100 py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[#53745D]" />
              </div>
            ) : recentBookings.length === 0 ? (
              <p className="border-t border-slate-100 px-5 py-8 text-center text-sm text-slate-400">
                Aucune réservation pour le moment
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 border-t border-slate-100">
                {recentBookings.map((booking: any) => {
                  const clientName = booking.client
                    ? `${booking.client.firstName} ${booking.client.lastName}`
                    : "Client inconnu";
                  const service = booking.bookedServices?.[0]?.serviceName ?? "—";
                  const date = dayjs(booking.appointmentStartDateTime).format(
                    "D MMM YYYY, HH:mm",
                  );
                  return (
                    <li
                      key={booking.id}
                      className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 truncate">{clientName}</p>
                        <p className="text-xs text-slate-500 truncate">{service}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="text-xs text-slate-500 hidden sm:block">{date}</p>
                        <BookingStatusBadge status={booking.status} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>

      </div>{/* fin grid 2 colonnes */}

      {/* Quick links */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/admin/calendrier"
          className="inline-flex items-center gap-2 rounded-lg border border-[#53745D]/30 bg-[#F0F4F1] px-4 py-2 text-sm font-medium text-[#3a5a47] hover:bg-[#D6E3D8] transition-colors"
        >
          <Calendar className="h-4 w-4" />
          Calendrier
        </Link>
        <Link
          href="/admin/mes-services"
          className="inline-flex items-center gap-2 rounded-lg border border-[#53745D]/30 bg-[#F0F4F1] px-4 py-2 text-sm font-medium text-[#3a5a47] hover:bg-[#D6E3D8] transition-colors"
        >
          <Scissors className="h-4 w-4" />
          Mes services
        </Link>
        <Link
          href="/admin/payments"
          className="inline-flex items-center gap-2 rounded-lg border border-[#53745D]/30 bg-[#F0F4F1] px-4 py-2 text-sm font-medium text-[#3a5a47] hover:bg-[#D6E3D8] transition-colors"
        >
          <DollarSign className="h-4 w-4" />
          Paiements
        </Link>
      </div>
    </PageWrapper>
  );
}
