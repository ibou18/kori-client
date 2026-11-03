"use client";

import PageWrapper from "@/app/components/block/PageWrapper";
import { CrmStatusBadge } from "@/app/components/crm/CrmStatusBadge";
import { useGetCrmFollowUps } from "@/app/data/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import dayjs from "dayjs";
import { ExternalLink, Store, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const HORIZONS = [
  { label: "En retard + aujourd'hui", days: 0 },
  { label: "7 jours", days: 7 },
  { label: "30 jours", days: 30 },
];

interface FollowUpItem {
  kind: "salon" | "user";
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  phone?: string;
  email?: string;
  crmStatus?: string | null;
  crmLastContactAt?: string | null;
  crmNextFollowUpAt?: string | null;
}

/** Relances CRM dues : salons et clients dont la prochaine relance est échue ou proche. */
export default function CrmFollowUpsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [days, setDays] = useState(7);

  const before = dayjs().endOf("day").add(days, "day").toISOString();
  const { data, isLoading } = useGetCrmFollowUps({ before, limit: 200 });
  const items: FollowUpItem[] = data?.data?.items ?? [];

  if (!session) {
    return (
      <PageWrapper title="Relances CRM">
        <p className="text-center mt-10">Connexion requise pour accéder à cette page!</p>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="Relances CRM"
      description="Salons et clients à recontacter, triés par date de relance"
      actions={
        <div className="flex gap-2">
          {HORIZONS.map((h) => (
            <Button
              key={h.days}
              size="sm"
              variant={days === h.days ? "default" : "outline"}
              onClick={() => setDays(h.days)}
            >
              {h.label}
            </Button>
          ))}
        </div>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading ? "Chargement…" : `${items.length} relance(s)`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune relance due sur cette période.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernier contact</TableHead>
                  <TableHead>Relance</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const overdue =
                    !!item.crmNextFollowUpAt && dayjs(item.crmNextFollowUpAt).isBefore(dayjs());
                  const name =
                    item.kind === "salon"
                      ? item.name
                      : `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim();
                  const href =
                    item.kind === "salon" ? `/admin/salons/${item.id}` : `/admin/users/${item.id}`;
                  return (
                    <TableRow key={`${item.kind}-${item.id}`} className={overdue ? "bg-red-50" : ""}>
                      <TableCell>
                        <span className="flex items-center gap-1 text-sm">
                          {item.kind === "salon" ? (
                            <>
                              <Store className="h-4 w-4" /> Salon
                            </>
                          ) : (
                            <>
                              <User className="h-4 w-4" /> {item.role === "CLIENT" ? "Client" : item.role}
                            </>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{name || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div>{item.phone || "—"}</div>
                        <div>{item.email || ""}</div>
                      </TableCell>
                      <TableCell>
                        <CrmStatusBadge status={item.crmStatus} />
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.crmLastContactAt
                          ? dayjs(item.crmLastContactAt).format("DD/MM/YYYY HH:mm")
                          : "—"}
                      </TableCell>
                      <TableCell className={`text-sm ${overdue ? "text-red-700 font-medium" : ""}`}>
                        {item.crmNextFollowUpAt
                          ? dayjs(item.crmNextFollowUpAt).format("DD/MM/YYYY HH:mm")
                          : "—"}
                        {overdue && " · en retard"}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => router.push(href)}>
                          <ExternalLink className="h-4 w-4 mr-1" /> Ouvrir
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
