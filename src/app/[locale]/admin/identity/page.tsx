/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { requestWrapper } from "@/config/requestsConfig";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Phone,
  MapPin,
  User,
  Mail,
  Calendar,
  Loader2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { VerificationStatus } from "@/app/interfaceHop";

interface IdentityVerification {
  id: string;
  userId: string;
  fullName: string;
  address?: string;
  phoneNumber?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  selfieUrl: string;
  status: VerificationStatus;
  reason?: string | null;
  isIdentityVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface ApiResponse {
  success: boolean;
  items: IdentityVerification[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function IdentityInfo() {
  const [verifications, setVerifications] = useState<IdentityVerification[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerification, setSelectedVerification] =
    useState<IdentityVerification | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageTitle, setImageTitle] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [statusAction, setStatusAction] = useState<
    VerificationStatus.VERIFIED | VerificationStatus.REJECTED | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchIdentityVerifications();
  }, []);

  const fetchIdentityVerifications = async () => {
    setLoading(true);
    try {
      const response = await requestWrapper.get("/identity/verifications");
      const data: ApiResponse = response.data;
      if (data.success) {
        setVerifications(data.items);
      } else {
        setError("Échec du chargement des vérifications d'identité");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des vérifications:", err);
      setError("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedVerification) return;

    setIsSubmitting(true);

    try {
      const payload = {
        status:
          statusAction === VerificationStatus.VERIFIED
            ? VerificationStatus.VERIFIED
            : VerificationStatus.REJECTED,
        reason: statusAction === VerificationStatus.REJECTED ? reason : null,
      };

      const response = await requestWrapper.put(
        `/identity/${selectedVerification.id}/status`,
        payload
      );

      if (response.data.success) {
        toast.success(
          statusAction === VerificationStatus.VERIFIED
            ? "Vérification d'identité approuvée"
            : "Vérification d'identité refusée"
        );

        // Mettre à jour l'état local
        setVerifications((prevVerifications) =>
          prevVerifications.map((v) =>
            v.id === selectedVerification.id
              ? {
                  ...v,
                  status:
                    statusAction === VerificationStatus.VERIFIED
                      ? VerificationStatus.VERIFIED
                      : VerificationStatus.REJECTED,
                  reason:
                    statusAction === VerificationStatus.REJECTED
                      ? reason
                      : null,
                  isIdentityVerified:
                    statusAction === VerificationStatus.VERIFIED,
                }
              : v
          )
        );

        closeStatusModal();
      } else {
        toast.error("Échec de la mise à jour du statut");
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour du statut:", err);
      toast.error("Une erreur est survenue lors de la mise à jour");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStatusModal = (
    verification: IdentityVerification,
    action: VerificationStatus.VERIFIED | VerificationStatus.REJECTED
  ) => {
    setSelectedVerification(verification);
    setStatusAction(action);
    setReason("");
    setShowStatusModal(true);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedVerification(null);
    setStatusAction(null);
    setReason("");
  };

  const openImageModal = (imageUrl: string, title: string) => {
    setCurrentImage(imageUrl);
    setImageTitle(title);
    setShowImageModal(true);
  };

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return <Badge className="bg-green-100 text-green-800">Vérifié</Badge>;
      case VerificationStatus.REJECTED:
        return <Badge className="bg-red-100 text-red-800">Refusé</Badge>;
      case VerificationStatus.PENDING:
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
        );
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case VerificationStatus.REJECTED:
        return <XCircle className="h-5 w-5 text-red-600" />;
      case VerificationStatus.PENDING:
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg text-muted-foreground">
          Chargement des vérifications...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <XCircle className="h-12 w-12 text-red-600" />
        <h3 className="mt-4 text-lg font-semibold">Erreur de chargement</h3>
        <p className="text-muted-foreground">{error}</p>
        <Button className="mt-4" onClick={() => fetchIdentityVerifications()}>
          Réessayer
        </Button>
      </div>
    );
  }

  if (verifications.length === 0) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center">
        <h3 className="text-lg font-semibold">
          Aucune vérification d'identité
        </h3>
        <p className="text-muted-foreground">
          Aucune demande de vérification n'a été soumise.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        Vérifications d'identité
      </h2>

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">
              Toutes ({verifications.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              En attente (
              {
                verifications.filter(
                  (v) => v.status === VerificationStatus.PENDING
                ).length
              }
              )
            </TabsTrigger>
            <TabsTrigger value={VerificationStatus.VERIFIED}>
              Vérifiées (
              {
                verifications.filter(
                  (v) => v.status === VerificationStatus.VERIFIED
                ).length
              }
              )
            </TabsTrigger>
            <TabsTrigger value={VerificationStatus.REJECTED}>
              Refusées (
              {
                verifications.filter(
                  (v) => v.status === VerificationStatus.REJECTED
                ).length
              }
              )
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-6">
          <VerificationsTable
            verifications={verifications}
            openImageModal={openImageModal}
            openStatusModal={openStatusModal}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <VerificationsTable
            verifications={verifications.filter(
              (v) => v.status === VerificationStatus.PENDING
            )}
            openImageModal={openImageModal}
            openStatusModal={openStatusModal}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value={VerificationStatus.VERIFIED} className="mt-6">
          <VerificationsTable
            verifications={verifications.filter(
              (v) => v.status === VerificationStatus.VERIFIED
            )}
            openImageModal={openImageModal}
            openStatusModal={openStatusModal}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>

        <TabsContent value={VerificationStatus.REJECTED} className="mt-6">
          <VerificationsTable
            verifications={verifications.filter(
              (v) => v.status === VerificationStatus.REJECTED
            )}
            openImageModal={openImageModal}
            openStatusModal={openStatusModal}
            getStatusBadge={getStatusBadge}
          />
        </TabsContent>
      </Tabs>

      {/* Modal pour afficher les images */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{imageTitle}</DialogTitle>
          </DialogHeader>
          <div className="relative h-[600px] w-full">
            {currentImage && (
              <Image
                src={currentImage}
                alt={imageTitle}
                fill
                className="object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal pour changer le statut */}
      <AlertDialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusAction === VerificationStatus.VERIFIED
                ? "Confirmer la vérification d'identité"
                : "Refuser la vérification d'identité"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusAction === VerificationStatus.VERIFIED
                ? "Êtes-vous sûr de vouloir valider cette identité ? L'utilisateur sera notifié que sa vérification est approuvée."
                : "Veuillez fournir la raison du refus. L'utilisateur sera notifié que sa vérification a été rejetée."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {statusAction === VerificationStatus.REJECTED && (
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Raison du refus (obligatoire)"
              className="min-h-[100px]"
            />
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={
                isSubmitting ||
                (statusAction === VerificationStatus.REJECTED && !reason.trim())
              }
              className={
                statusAction === VerificationStatus.VERIFIED
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {statusAction === VerificationStatus.VERIFIED
                ? "Valider l'identité"
                : "Refuser l'identité"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface VerificationsTableProps {
  verifications: IdentityVerification[];
  openImageModal: (url: string, title: string) => void;
  openStatusModal: (
    verification: IdentityVerification,
    action: VerificationStatus.VERIFIED | VerificationStatus.REJECTED
  ) => void;
  getStatusBadge: (status: VerificationStatus) => JSX.Element;
}

function VerificationsTable({
  verifications,
  openImageModal,
  openStatusModal,
  getStatusBadge,
}: VerificationsTableProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  );

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP à HH:mm", { locale: fr });
  };

  return (
    <div className="space-y-4">
      {verifications.map((verification) => (
        <Card
          key={verification.id}
          className={expandedItems[verification.id] ? "border-primary" : ""}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={verification.selfieUrl}
                    alt={verification.fullName}
                  />
                  <AvatarFallback>
                    {verification.user.firstName[0]}
                    {verification.user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{verification.fullName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {verification.user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  {getStatusBadge(verification.status)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(verification.id)}
                >
                  {expandedItems[verification.id] ? "Réduire" : "Détails"}
                </Button>
              </div>
            </div>
          </CardHeader>

          {expandedItems[verification.id] && (
            <>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Informations personnelles
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{verification.fullName}</span>
                        </div>
                        {verification.address && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{verification.address}</span>
                          </div>
                        )}
                        {verification.phoneNumber && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{verification.phoneNumber}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{verification.user.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>
                            Soumis le {formatDate(verification.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {verification.status === VerificationStatus.REJECTED &&
                      verification.reason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
                          <h4 className="text-sm font-medium text-red-800 mb-1">
                            Raison du refus:
                          </h4>
                          <p className="text-sm text-red-700">
                            {verification.reason}
                          </p>
                        </div>
                      )}

                    {verification.status === VerificationStatus.PENDING && (
                      <div className="flex space-x-2 mt-4">
                        <Button
                          onClick={() =>
                            openStatusModal(
                              verification,
                              VerificationStatus.VERIFIED
                            )
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approuver
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            openStatusModal(
                              verification,
                              VerificationStatus.REJECTED
                            )
                          }
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Refuser
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Documents d'identité
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {verification.idFrontUrl && (
                        <div
                          className="relative h-36 border rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() =>
                            openImageModal(
                              verification.idFrontUrl!,
                              "Recto de la pièce d'identité"
                            )
                          }
                        >
                          <Image
                            src={verification.idFrontUrl}
                            alt="Recto de la pièce d'identité"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                            <Eye className="h-6 w-6 text-white" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-xs text-white text-center">
                            Recto
                          </div>
                        </div>
                      )}

                      {verification.idBackUrl && (
                        <div
                          className="relative h-36 border rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() =>
                            openImageModal(
                              verification.idBackUrl!,
                              "Verso de la pièce d'identité"
                            )
                          }
                        >
                          <Image
                            src={verification.idBackUrl}
                            alt="Verso de la pièce d'identité"
                            fill
                            className="object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                            <Eye className="h-6 w-6 text-white" />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-xs text-white text-center">
                            Verso
                          </div>
                        </div>
                      )}

                      <div
                        className="relative h-36 border rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() =>
                          openImageModal(
                            verification.selfieUrl,
                            "Photo de selfie"
                          )
                        }
                      >
                        <Image
                          src={verification.selfieUrl}
                          alt="Selfie"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-1 text-xs text-white text-center">
                          Selfie
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <div className="w-full text-right text-xs text-muted-foreground">
                  ID: {verification.id}
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      ))}
    </div>
  );
}
