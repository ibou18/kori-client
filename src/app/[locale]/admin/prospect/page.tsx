"use client";

import { AdminListLayout } from "@/app/components/AdminListLayout";
import { GenericModal } from "@/app/components/GenericModal";
import { useGetProspects, useUpdateProspectStatus } from "@/app/data/hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import dayjs from "dayjs";
import { Mail, Phone } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

// Types de statut pour les prospects
const PROSPECT_STATUSES = [
  { value: "NEW", label: "Nouveau", color: "bg-blue-100 text-blue-800" },
  { value: "CONTACTED", label: "Contacté", color: "bg-purple-100 text-purple-800" },
  { value: "INTERESTED", label: "Intéressé", color: "bg-green-100 text-green-800" },
  { value: "IN_PROGRESS", label: "En cours", color: "bg-yellow-100 text-yellow-800" },
  { value: "CONVERTED", label: "Converti", color: "bg-emerald-100 text-emerald-800" },
  { value: "NOT_INTERESTED", label: "Pas intéressé", color: "bg-gray-100 text-gray-800" },
  { value: "INVALID", label: "Invalide", color: "bg-red-100 text-red-800" },
];

interface Prospect {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  indicatif: string;
  services: string[];
  source: string;
  status: string;
  notes?: string;
  contactedAt?: string;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
}

function ProspectStatusBadge({ status }: { status: string }) {
  const statusConfig = PROSPECT_STATUSES.find((s) => s.value === status);
  return (
    <Badge className={statusConfig?.color || "bg-gray-100 text-gray-800"}>
      {statusConfig?.label || status}
    </Badge>
  );
}

function ProspectDetailsModal({
  prospect,
  onStatusChange,
}: {
  prospect: Prospect | null;
  onStatusChange: (id: string, status: string, notes?: string) => void;
}) {
  const [newStatus, setNewStatus] = useState(prospect?.status || "NEW");
  const [notes, setNotes] = useState(prospect?.notes || "");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!prospect) return null;

  const handleSubmit = async () => {
    setIsUpdating(true);
    await onStatusChange(prospect.id, newStatus, notes);
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6">
      {/* Informations personnelles */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Informations personnelles</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nom complet</p>
            <p className="font-medium">{prospect.firstName} {prospect.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Source</p>
            <Badge variant="outline">{prospect.source}</Badge>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
        <div className="space-y-3">
          <a
            href={`mailto:${prospect.email}`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <Mail className="w-4 h-4" />
            {prospect.email}
          </a>
          <a
            href={`tel:${prospect.indicatif}${prospect.phone}`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <Phone className="w-4 h-4" />
            {prospect.indicatif} {prospect.phone}
          </a>
        </div>
      </div>

      {/* Services d'intérêt */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Services d&apos;intérêt</h3>
        <div className="flex flex-wrap gap-2">
          {prospect.services.length > 0 ? (
            prospect.services.map((service) => (
              <Badge key={service} variant="secondary">
                {service}
              </Badge>
            ))
          ) : (
            <p className="text-sm text-gray-500">Aucun service spécifié</p>
          )}
        </div>
      </div>

      {/* Dates importantes */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Historique</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Inscription</p>
            <p className="font-medium">{dayjs(prospect.createdAt).format("DD/MM/YYYY HH:mm")}</p>
          </div>
          {prospect.contactedAt && (
            <div>
              <p className="text-gray-500">Contacté le</p>
              <p className="font-medium">{dayjs(prospect.contactedAt).format("DD/MM/YYYY HH:mm")}</p>
            </div>
          )}
          {prospect.convertedAt && (
            <div>
              <p className="text-gray-500">Converti le</p>
              <p className="font-medium">{dayjs(prospect.convertedAt).format("DD/MM/YYYY HH:mm")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Mise à jour du statut */}
      <div className="border-t pt-4 space-y-4">
        <h3 className="font-semibold text-gray-900">Mettre à jour le statut</h3>
        <div className="space-y-3">
          <div>
            <Label>Statut</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                {PROSPECT_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              placeholder="Ajouter des notes sur ce prospect..."
              rows={3}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isUpdating}
            className="w-full bg-[#53745D] hover:bg-[#3d5a46]"
          >
            {isUpdating ? "Mise à jour..." : "Mettre à jour"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProspectPage() {
  const { data: session } = useSession();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading } = useGetProspects();
  const updateStatusMutation = useUpdateProspectStatus();

  if (!session) {
    return (
      <p className="text-center mt-10">
        Connexion requise pour accéder à cette page!
      </p>
    );
  }

  // Filtrer par statut
  const filteredData = data?.data?.filter((prospect: Prospect) => {
    if (statusFilter === "all") return true;
    return prospect.status === statusFilter;
  });

  const handleView = (prospect: Prospect) => {
    setSelectedProspect(prospect);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id: string, status: string, notes?: string) => {
    await updateStatusMutation.mutateAsync({ id, status, notes });
    setIsModalOpen(false);
  };

  const columns = [
    {
      key: "name",
      header: "Nom",
      render: (prospect: Prospect) => (
        <div>
          <div className="font-medium">
            {prospect.firstName} {prospect.lastName}
          </div>
          <div className="text-sm text-gray-600">{prospect.email}</div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Téléphone",
      render: (prospect: Prospect) => (
        <div className="text-sm">
          {prospect.indicatif} {prospect.phone}
        </div>
      ),
    },
    {
      key: "services",
      header: "Services",
      render: (prospect: Prospect) => (
        <div className="flex flex-wrap gap-1">
          {prospect.services.slice(0, 2).map((service) => (
            <Badge key={service} variant="outline" className="text-xs">
              {service}
            </Badge>
          ))}
          {prospect.services.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{prospect.services.length - 2}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Statut",
      render: (prospect: Prospect) => (
        <ProspectStatusBadge status={prospect.status} />
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (prospect: Prospect) => (
        <Badge variant="secondary" className="text-xs">
          {prospect.source}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Inscrit le",
      render: (prospect: Prospect) => (
        <div className="text-sm text-gray-600">
          {dayjs(prospect.createdAt).format("DD MMM YYYY")}
        </div>
      ),
    },
  ];

  const filterComponent = (
    <Select value={statusFilter} onValueChange={setStatusFilter}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filtrer par statut" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous les prospects</SelectItem>
        {PROSPECT_STATUSES.map((status) => (
          <SelectItem key={status.value} value={status.value}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <>
      <AdminListLayout
        title="Prospects"
        data={filteredData}
        isLoading={isLoading}
        columns={columns}
        searchKeys={["firstName", "lastName", "email", "phone"]}
        onView={handleView}
        emptyMessage="Aucun prospect trouvé"
        filterComponent={filterComponent}
      />
      <GenericModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Détails du prospect"
        description="Informations complètes et suivi du prospect"
        size="lg"
      >
        <ProspectDetailsModal
          prospect={selectedProspect}
          onStatusChange={handleStatusChange}
        />
      </GenericModal>
    </>
  );
}
