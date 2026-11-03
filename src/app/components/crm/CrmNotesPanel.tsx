"use client";

import {
  useCreateCrmNote,
  useDeleteCrmNote,
  useGetCrmNotes,
  useUpdateCrmNote,
  type CrmSubject,
} from "@/app/data/hooks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { CalendarClock, ClipboardList, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { CRM_NOTE_TYPES, CRM_STATUSES, type CrmNote, type CrmState } from "./crmConstants";
import { CrmStatusBadge } from "./CrmStatusBadge";

const KEEP_STATUS = "__keep__";
/** Rôles autorisés côté API (`/crm`, @Authorized(["ADMIN","SUPPORT"])). */
const CRM_ROLES = ["ADMIN", "SUPPORT"];

interface CrmNotesPanelProps {
  subject: CrmSubject;
  /** Libellé de la cible pour les textes (« ce salon », « ce client »). */
  subjectLabel?: string;
}

function noteTypeMeta(type: string) {
  return CRM_NOTE_TYPES.find((t) => t.value === type) ?? CRM_NOTE_TYPES[0];
}

function formatDateTime(value?: string | null) {
  return value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "—";
}

/** Convertit une valeur <input type="datetime-local"> en ISO, ou null. */
function toIso(local: string): string | null {
  if (!local) return null;
  const date = new Date(local);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toLocalInput(iso?: string | null): string {
  return iso ? dayjs(iso).format("YYYY-MM-DDTHH:mm") : "";
}

/**
 * Panneau « Suivi CRM » : état courant (statut, dernier contact, prochaine relance),
 * formulaire d'ajout de note et historique. Utilisé sur la fiche salon et la fiche
 * utilisateur de l'admin.
 */
export function CrmNotesPanel({ subject, subjectLabel = "cette fiche" }: CrmNotesPanelProps) {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const canUseCrm = !!role && CRM_ROLES.includes(role);

  const { data, isLoading } = useGetCrmNotes(canUseCrm ? subject : null, { limit: 100 });
  const createNote = useCreateCrmNote(subject);
  const updateNote = useUpdateCrmNote(subject);
  const deleteNote = useDeleteCrmNote(subject);

  const [type, setType] = useState("CALL");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<string>(KEEP_STATUS);
  const [followUpAt, setFollowUpAt] = useState("");

  const [editing, setEditing] = useState<CrmNote | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editFollowUpAt, setEditFollowUpAt] = useState("");
  const [deleting, setDeleting] = useState<CrmNote | null>(null);

  const notes: CrmNote[] = data?.data?.notes ?? [];
  const state: CrmState = data?.data?.state ?? {};
  const total: number = data?.data?.total ?? notes.length;

  const nextFollowUp = state.crmNextFollowUpAt ? dayjs(state.crmNextFollowUpAt) : null;
  const followUpOverdue = !!nextFollowUp && nextFollowUp.isBefore(dayjs());

  const canSubmit =
    (content.trim().length > 0 || status !== KEEP_STATUS) && !createNote.isPending;

  // La fiche salon est aussi ouverte par les OWNER : le CRM est interne à l'équipe Kori.
  if (!canUseCrm) return null;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await createNote.mutateAsync({
      type,
      content: content.trim(),
      status: status === KEEP_STATUS ? null : status,
      followUpAt: toIso(followUpAt),
    });
    setContent("");
    setStatus(KEEP_STATUS);
    setFollowUpAt("");
  };

  const startEdit = (note: CrmNote) => {
    setEditing(note);
    setEditContent(note.content);
    setEditFollowUpAt(toLocalInput(note.followUpAt));
  };

  const handleEditSave = async () => {
    if (!editing) return;
    await updateNote.mutateAsync({
      id: editing.id,
      content: editContent.trim(),
      followUpAt: toIso(editFollowUpAt),
    });
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteNote.mutateAsync(deleting.id);
    setDeleting(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Suivi CRM
          </span>
          <CrmStatusBadge status={state.crmStatus} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* État courant */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground">Dernier contact</p>
            <p className="font-medium">{formatDateTime(state.crmLastContactAt)}</p>
          </div>
          <div className={`rounded-md border p-3 ${followUpOverdue ? "border-red-300 bg-red-50" : ""}`}>
            <p className="text-muted-foreground flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" /> Prochaine relance
            </p>
            <p className={`font-medium ${followUpOverdue ? "text-red-700" : ""}`}>
              {formatDateTime(state.crmNextFollowUpAt)}
              {followUpOverdue && " · en retard"}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-muted-foreground">Notes</p>
            <p className="font-medium">{total}</p>
          </div>
        </div>

        {/* Nouvelle note */}
        <div className="space-y-3 rounded-md border p-4 bg-muted/30">
          <p className="text-sm font-medium">Ajouter une note sur {subjectLabel}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRM_NOTE_TYPES.filter((t) => t.value !== "STATUS_CHANGE").map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Nouveau statut</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={KEEP_STATUS}>Inchangé</SelectItem>
                  {CRM_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Relance</Label>
              <Input
                type="datetime-local"
                value={followUpAt}
                onChange={(e) => setFollowUpAt(e.target.value)}
              />
            </div>
          </div>
          <Textarea
            placeholder="Résumé de l'appel, décision prise, prochaine étape…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={5000}
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {createNote.isPending ? "Enregistrement…" : "Ajouter la note"}
            </Button>
          </div>
        </div>

        {/* Historique */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Historique</p>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune note pour le moment.</p>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => {
                const meta = noteTypeMeta(note.type);
                const Icon = meta.icon;
                const isEditing = editing?.id === note.id;
                const author = note.author
                  ? `${note.author.firstName} ${note.author.lastName}`.trim()
                  : "Auteur inconnu";
                return (
                  <li key={note.id} className="rounded-md border p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
                        <span className="font-medium text-foreground">{meta.label}</span>
                        {note.status && <CrmStatusBadge status={note.status} />}
                        {note.followUpAt && (
                          <span className="flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5" />
                            relance {formatDateTime(note.followUpAt)}
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-2">
                        {author} · {formatDateTime(note.createdAt)}
                        {!isEditing && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => startEdit(note)}
                              aria-label="Modifier la note"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-600"
                              onClick={() => setDeleting(note)}
                              aria-label="Supprimer la note"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </span>
                    </div>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={3}
                          maxLength={5000}
                        />
                        <div className="flex flex-wrap items-end gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Relance</Label>
                            <Input
                              type="datetime-local"
                              value={editFollowUpAt}
                              onChange={(e) => setEditFollowUpAt(e.target.value)}
                            />
                          </div>
                          <div className="ml-auto flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditing(null)}>
                              <X className="h-3.5 w-3.5 mr-1" /> Annuler
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleEditSave}
                              disabled={updateNote.isPending || (!editContent.trim() && !note.status)}
                            >
                              Enregistrer
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      note.content && (
                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      )
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette note ?</AlertDialogTitle>
            <AlertDialogDescription>
              La note sera définitivement supprimée. Le statut et la prochaine relance seront
              recalculés depuis les notes restantes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
              disabled={deleteNote.isPending}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
