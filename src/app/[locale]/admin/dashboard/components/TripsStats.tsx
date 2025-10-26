import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  PackageIcon,
  MapIcon,
  TruckIcon,
  PlaneIcon,
  CarIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface TripData {
  id: string;
  travelerId: string;
  startCity: string;
  startCountry: string;
  endCity: string;
  endCountry: string;
  waypoints: any[];
  startTime: string;
  endTime: string;
  price: number | null;
  vehicleType: string;
  maxPackages: number;
  spaceCapacities: string | null;
  maxWeight: number | null;
  qrCodeUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  notes: string | null;
  _count: {
    deliveries: number;
  };
}

interface TravelerStatsProps {
  data: {
    totalTrips: number;
    tripsByStatus: {
      planned: number;
      inProgress: number;
      completed: number;
      cancelled: number;
    };
    deliveriesCount: number;
    upcomingTrips: TripData[];
  };
}

export default function TravelerStats({ data }: TravelerStatsProps) {
  // Couleurs pour les graphiques
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const STATUS_COLORS: Record<string, string> = {
    planned: "#FFBB28", // jaune
    inProgress: "#0088FE", // bleu
    completed: "#00C49F", // vert
    cancelled: "#FF8042", // orange
  };

  const VEHICLE_ICONS: Record<string, JSX.Element> = {
    CAR: <CarIcon className="h-4 w-4" />,
    TRUCK: <TruckIcon className="h-4 w-4" />,
    PLAN: <PlaneIcon className="h-4 w-4" />,
  };

  // Formatage des données pour le graphique en camembert des statuts
  const statusData = Object.entries(data?.tripsByStatus || {}).map(
    ([status, count]) => ({
      name: status,
      value: count,
    })
  );

  // Calculer la répartition par type de véhicule
  const vehicleTypes = data?.upcomingTrips.reduce(
    (acc: Record<string, number>, trip) => {
      acc[trip.vehicleType] = (acc[trip.vehicleType] || 0) + 1;
      return acc;
    },
    {}
  );

  const vehicleData = Object.entries(vehicleTypes || {}).map(
    ([type, count]) => ({
      name: type,
      value: count,
    })
  );

  // Personnalisation du tooltip pour les graphiques
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow">
          <p className="font-medium">{`${payload[0].name}`}</p>
          <p
            style={{ color: payload[0].color }}
          >{`Nombre: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Calculer le taux de livraison (livraisons / voyages complétés)

  if (!data) {
    return <div>Aucune donnée disponible</div>;
  }

  return (
    <div>
      <div className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold">Statistiques de voyages</h2>

        {/* Graphiques */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Répartition par statut */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Répartition par statut</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            STATUS_COLORS[entry.name] ||
                            COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(data?.tripsByStatus || {}).map(
                  ([status, count]) => (
                    <Badge
                      key={status}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: STATUS_COLORS[status] || "#888",
                        }}
                      />
                      {status}: {String(count)}
                    </Badge>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Répartition par type de véhicule */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Répartition par véhicule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {vehicleData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(vehicleTypes || {}).map(([type, count]) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    <span className="mr-1">
                      {VEHICLE_ICONS[type] || <TruckIcon className="h-3 w-3" />}
                    </span>
                    {type}: {String(count)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des voyages à venir */}
        <Card>
          <CardHeader>
            <CardTitle>Prochains voyages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.upcomingTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between border-b pb-4"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      {VEHICLE_ICONS[trip.vehicleType] || (
                        <TruckIcon className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {trip.startCity} → {trip.endCity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {trip.startCountry} → {trip.endCountry}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(trip.startTime), "dd/MM/yyyy HH:mm")}
                      </p>
                      <div className="flex items-center justify-end mt-1">
                        <PackageIcon className="h-3 w-3 mr-1 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {trip._count.deliveries} / {trip.maxPackages}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`
                        ${
                          trip.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : ""
                        } 
                        ${
                          trip.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : ""
                        } 
                        ${
                          trip.status === "PLANNED"
                            ? "bg-yellow-100 text-yellow-800"
                            : ""
                        }
                        ${
                          trip.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : ""
                        }
                      `}
                    >
                      {trip.status}
                    </Badge>
                  </div>
                </div>
              ))}

              {data.upcomingTrips.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  Aucun voyage à venir
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
