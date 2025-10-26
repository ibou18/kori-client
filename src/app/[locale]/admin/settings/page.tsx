"use client";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useGetSettings, useUpdateSetting } from "@/app/data/hooks";

// Type pour l'objet des paramètres
interface AppSettings {
  id: string;
  isAppleAuth: boolean;
  isGoogleAuth: boolean;
  isInReview: boolean;
  isButtonSubscription: boolean;
  isButtonPayment: boolean;
}

export default function SettingsPage() {
  const { data, isLoading } = useGetSettings();
  const { mutateAsync: updateSettingFn } = useUpdateSetting();
  // État initial des paramètres
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    if (data) {
      setSettings(data[0]);
    }
  }, [data]);

  // État pour gérer le chargement pendant la sauvegarde
  const [isSaving, setIsSaving] = useState(false);

  // Fonction pour mettre à jour un paramètre
  const updateSetting = (key: keyof AppSettings, value: boolean) => {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            [key]: value,
          }
        : prev
    );
  };

  // Fonction pour sauvegarder les modifications
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      // Simuler un appel API pour sauvegarder les paramètres
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await updateSettingFn(settings, {
        onSuccess: (data) => {
          setSettings(data);
          toast.success("Paramètres sauvegardés", {
            description: "Vos modifications ont été enregistrées avec succès.",
          });
        },
      });
    } catch (error) {
      toast.error("Erreur", {
        description: "Impossible de sauvegarder les paramètres.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center items-center mx-auto py-6 ">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Paramètres de l&rsquo;application
        </h1>
        <Button onClick={saveSettings} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            "Sauvegarder les changements"
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Carte pour l'authentification Apple */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Authentification Apple</CardTitle>
              <Badge variant={settings.isAppleAuth ? "default" : "outline"}>
                {settings.isAppleAuth ? "Activé" : "Désactivé"}
              </Badge>
            </div>
            <CardDescription>
              Permet aux utilisateurs de se connecter avec leur compte Apple
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="apple-auth"
                checked={settings.isAppleAuth}
                onChange={(checked) => updateSetting("isAppleAuth", checked)}
              />
              <label htmlFor="apple-auth">
                {settings.isAppleAuth ? "Activer" : "Désactiver"}{" "}
                l&rsquo;authentification Apple
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Carte pour l'authentification Google */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Authentification Google</CardTitle>
              <Badge variant={settings.isGoogleAuth ? "default" : "outline"}>
                {settings.isGoogleAuth ? "Activé" : "Désactivé"}
              </Badge>
            </div>
            <CardDescription>
              Permet aux utilisateurs de se connecter avec leur compte Google
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="google-auth"
                checked={settings.isGoogleAuth}
                onChange={(checked) => updateSetting("isGoogleAuth", checked)}
              />
              <label htmlFor="google-auth">
                {settings.isGoogleAuth ? "Activer" : "Désactiver"}{" "}
                l&rsquo;authentification Google
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Carte pour le bouton d'abonnement */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Bouton d&rsquo;abonnement</CardTitle>
              <Badge
                variant={settings.isButtonSubscription ? "default" : "outline"}
              >
                {settings.isButtonSubscription ? "Visible" : "Masqué"}
              </Badge>
            </div>
            <CardDescription>
              Contrôle la visibilité du bouton d&rsquo;abonnement dans
              l&rsquo;application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="subscription-button"
                checked={settings.isButtonSubscription}
                onChange={(checked) =>
                  updateSetting("isButtonSubscription", checked)
                }
              />
              <label htmlFor="subscription-button">
                {settings.isButtonSubscription ? "Afficher" : "Masquer"} le
                bouton d&rsquo;abonnement
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Carte pour le bouton de paiement */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Bouton de paiement</CardTitle>
              <Badge variant={settings.isButtonPayment ? "default" : "outline"}>
                {settings.isButtonPayment ? "Visible" : "Masqué"}
              </Badge>
            </div>
            <CardDescription>
              Contrôle la visibilité du bouton de paiement dans
              l&rsquo;application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="payment-button"
                checked={settings.isButtonPayment}
                onChange={(checked) =>
                  updateSetting("isButtonPayment", checked)
                }
              />
              <label htmlFor="payment-button">
                {settings.isButtonPayment ? "Afficher" : "Masquer"} le bouton de
                paiement
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Carte pour le mode révision */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle>Mode révision</CardTitle>
              <Badge variant={settings.isInReview ? "default" : "outline"}>
                {settings.isInReview ? "Actif" : "Inactif"}
              </Badge>
            </div>
            <CardDescription>
              Active le mode révision pour l&rsquo;App Store ou Google Play
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="in-review"
                checked={settings.isInReview}
                onChange={(checked) => updateSetting("isInReview", checked)}
              />
              <label htmlFor="in-review">
                {settings.isInReview ? "Activer" : "Désactiver"} le mode
                révision
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
