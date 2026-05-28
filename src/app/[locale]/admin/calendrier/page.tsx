"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { BookingDetailsModal } from "@/app/components/BookingDetailsModal";
import { GenericModal } from "@/app/components/GenericModal";
import { useGetSalon, useGetSalonBookings } from "@/app/data/hooks";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import isBetween from "dayjs/plugin/isBetween";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  LayoutGrid,
  List,
  User,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import { Calendar as BigCalendar, dayjsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.locale("fr");

const localizer = dayjsLocalizer(dayjs);

// Palette de couleurs pour les employés
const EMPLOYEE_PALETTE = [
  "#53745D",
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#06B6D4",
];

const STATUS_DEFAULT_COLOR = "#94A3B8";

const MESSAGES_FR = {
  allDay: "Journée",
  previous: "Précédent",
  next: "Suivant",
  today: "Aujourd'hui",
  month: "Mois",
  week: "Semaine",
  day: "Jour",
  agenda: "Agenda",
  date: "Date",
  time: "Heure",
  event: "Événement",
  noEventsInRange: "Aucun rendez-vous sur cette période",
  showMore: (total: number) => `+${total} de plus`,
};

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role?: string;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

function EmployeeChip({
  employee,
  color,
  selected,
  onClick,
}: {
  employee: Employee;
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        selected
          ? "border-transparent text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
      style={selected ? { backgroundColor: color } : {}}
    >
      {employee.avatar ? (
        <img
          src={employee.avatar}
          alt={employee.firstName}
          className="h-5 w-5 rounded-full object-cover"
        />
      ) : (
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white"
          style={{ backgroundColor: selected ? "rgba(255,255,255,0.3)" : color }}
        >
          {getInitials(employee.firstName, employee.lastName)}
        </span>
      )}
      {employee.firstName} {employee.lastName}
    </button>
  );
}

export default function CalendrierPage() {
  const { data: session } = useSession();
  const user = session?.user as { role?: string; salonId?: string } | undefined;
  const salonId = user?.salonId ?? "";

  const [view, setView] = useState<"month" | "week" | "day">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // null = tous les employés
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Récupérer le salon pour avoir la liste des employés
  const { data: salonRes } = useGetSalon(salonId);
  const salon = (salonRes as any)?.data ?? (salonRes as any);

  const employees: Employee[] = useMemo(() => {
    const list: Employee[] = [];
    // Ajouter le propriétaire si disponible
    if (salon?.owner) {
      list.push({ ...salon.owner, role: "OWNER" });
    }
    // Ajouter les employés
    if (Array.isArray(salon?.employees)) {
      salon.employees.forEach((e: Employee) => list.push(e));
    }
    return list;
  }, [salon]);

  // Map id → couleur déterministe
  const employeeColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    employees.forEach((e, i) => {
      map[e.id] = EMPLOYEE_PALETTE[i % EMPLOYEE_PALETTE.length];
    });
    return map;
  }, [employees]);

  const rangeStart = useMemo(() => {
    if (view === "month")
      return dayjs(currentDate).startOf("month").subtract(7, "day").format("YYYY-MM-DD");
    if (view === "week")
      return dayjs(currentDate).startOf("isoWeek").format("YYYY-MM-DD");
    return dayjs(currentDate).format("YYYY-MM-DD");
  }, [currentDate, view]);

  const rangeEnd = useMemo(() => {
    if (view === "month")
      return dayjs(currentDate).endOf("month").add(7, "day").format("YYYY-MM-DD");
    if (view === "week")
      return dayjs(currentDate).endOf("isoWeek").format("YYYY-MM-DD");
    return dayjs(currentDate).add(1, "day").format("YYYY-MM-DD");
  }, [currentDate, view]);

  const { data: bookingsRes, isLoading } = useGetSalonBookings(salonId, {
    startDate: rangeStart,
    endDate: rangeEnd,
    limit: 100,
    status: "CONFIRMED",
    ...(selectedEmployeeId ? { employeeIds: selectedEmployeeId } : {}),
  });

  const bookings: any[] = useMemo(() => {
    const raw = bookingsRes as any;
    if (!raw) return [];
    return Array.isArray(raw.data) ? raw.data : raw.data?.bookings ?? [];
  }, [bookingsRes]);

  const events = useMemo(
    () =>
      bookings.map((b: any) => {
        const clientName = b.client
          ? `${b.client.firstName} ${b.client.lastName}`
          : "Client";
        const employeeName = b.employee
          ? `${b.employee.firstName} ${b.employee.lastName}`
          : null;
        return {
          id: b.id,
          title: employeeName ? `${clientName} · ${employeeName}` : clientName,
          start: new Date(b.appointmentStartDateTime),
          end: new Date(b.appointmentEndDateTime),
          resource: b,
        };
      }),
    [bookings],
  );

  const eventPropGetter = (event: any) => {
    const empId: string | undefined = event.resource?.employee?.id;
    const bg = empId && employeeColorMap[empId]
      ? employeeColorMap[empId]
      : STATUS_DEFAULT_COLOR;
    return {
      style: {
        backgroundColor: bg,
        borderColor: bg,
        color: "#fff",
        borderRadius: "6px",
        fontSize: "12px",
        padding: "2px 6px",
      },
    };
  };

  const navigate = (dir: 1 | -1) => {
    const unit = view === "month" ? "month" : view === "week" ? "week" : "day";
    setCurrentDate(dayjs(currentDate).add(dir, unit).toDate());
  };

  const periodLabel = useMemo(() => {
    if (view === "month") return dayjs(currentDate).format("MMMM YYYY");
    if (view === "week") {
      const start = dayjs(currentDate).startOf("isoWeek");
      const end = dayjs(currentDate).endOf("isoWeek");
      return `${start.format("D MMM")} – ${end.format("D MMM YYYY")}`;
    }
    return dayjs(currentDate).format("dddd D MMMM YYYY");
  }, [currentDate, view]);

  if (!salonId) {
    return (
      <PageWrapper title="Calendrier">
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm">
          Aucun salon associé à votre compte.
        </p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Calendrier des rendez-vous">
      {/* Toolbar navigation */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Aujourd&apos;hui
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-slate-800 capitalize">{periodLabel}</span>
        </div>

        {/* Vue selector */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
          {(["day", "week", "month"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === v
                  ? "bg-[#53745D] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {v === "day" && <Clock className="h-3 w-3" />}
              {v === "week" && <List className="h-3 w-3" />}
              {v === "month" && <LayoutGrid className="h-3 w-3" />}
              {v === "day" ? "Jour" : v === "week" ? "Semaine" : "Mois"}
            </button>
          ))}
        </div>
      </div>

      {/* Filtre par employé */}
      {employees.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <User className="h-3.5 w-3.5" />
            Employé :
          </span>
          {/* Chip "Tous" */}
          <button
            onClick={() => setSelectedEmployeeId(null)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
              selectedEmployeeId === null
                ? "border-transparent bg-slate-800 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            Tous
            {selectedEmployeeId === null && bookings.length > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] tabular-nums">
                {bookings.length}
              </span>
            )}
          </button>

          {employees.map((emp) => {
            const color = employeeColorMap[emp.id] ?? "#53745D";
            const count = selectedEmployeeId === emp.id ? bookings.length : undefined;
            return (
              <EmployeeChip
                key={emp.id}
                employee={emp}
                color={color}
                selected={selectedEmployeeId === emp.id}
                onClick={() =>
                  setSelectedEmployeeId(
                    selectedEmployeeId === emp.id ? null : emp.id,
                  )
                }
              />
            );
          })}

          {/* Légende couleurs (mode "Tous") */}
          {selectedEmployeeId === null && employees.length > 1 && (
            <span className="ml-2 text-xs text-slate-400">
              — chaque couleur représente un employé
            </span>
          )}
        </div>
      )}

      {/* Calendrier */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <style>{`
          .rbc-toolbar { display: none; }
          .rbc-header { background: #F8FAFC; font-size: 12px; font-weight: 600; color: #475569; padding: 8px; }
          .rbc-today { background-color: #F0F4F1 !important; }
          .rbc-current-time-indicator { background-color: #53745D; }
          .rbc-event:focus { outline: none; }
          .rbc-show-more { color: #53745D; font-size: 11px; }
          .rbc-time-slot { font-size: 11px; color: #94A3B8; }
          .rbc-allday-cell { font-size: 11px; }
        `}</style>
        {isLoading ? (
          <div className="flex h-[600px] items-center justify-center text-slate-400">
            <div className="text-center">
              <Calendar className="mx-auto mb-2 h-8 w-8 animate-pulse" />
              <p className="text-sm">Chargement des rendez-vous…</p>
            </div>
          </div>
        ) : (
          <BigCalendar
            localizer={localizer}
            events={events}
            view={view}
            onView={() => {}}
            date={currentDate}
            onNavigate={setCurrentDate}
            onSelectEvent={(event: any) => {
              setSelectedBooking(event.resource);
              setIsModalOpen(true);
            }}
            eventPropGetter={eventPropGetter}
            messages={MESSAGES_FR}
            culture="fr"
            style={{ height: 650, padding: "8px" }}
            popup
            tooltipAccessor={(event: any) => {
              const b = event.resource;
              const services =
                b?.bookedServices?.map((s: any) => s.serviceName).join(", ") ?? "";
              const emp = b?.employee
                ? `${b.employee.firstName} ${b.employee.lastName}`
                : "";
              return [event.title, services, emp].filter(Boolean).join(" — ");
            }}
          />
        )}
      </div>

      {/* Modal détail */}
      <GenericModal
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsModalOpen(false);
            setSelectedBooking(null);
          }
        }}
        title="Détails du rendez-vous"
        size="2xl"
      >
        <BookingDetailsModal booking={selectedBooking} />
      </GenericModal>
    </PageWrapper>
  );
}
